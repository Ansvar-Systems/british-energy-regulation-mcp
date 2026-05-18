#!/usr/bin/env node

/**
 * British Energy Regulation MCP -- stdio entry point.
 *
 * Provides MCP tools for querying British energy regulators:
 *   - Ofgem (Office of Gas and Electricity Markets)
 *   - NESO (National Energy System Operator)
 *   - DESNZ (Department for Energy Security and Net Zero)
 *   - HSE (Health and Safety Executive, Energy Division)
 *
 * Tool prefix: gb_energy_
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  listRegulators,
  searchRegulations,
  getRegulationByReference,
  searchGridCodes,
  getGridCode,
  searchDecisions,
  getMetadataValue,
  getRecordCounts,
  getRegulationCountByRegulator,
} from "./db.js";
import { buildCitation } from './citation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pkgVersion = "0.1.0";
try {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, "..", "package.json"), "utf8"),
  ) as { version: string };
  pkgVersion = pkg.version;
} catch {
  // fallback to default
}

const SERVER_NAME = "british-energy-regulation-mcp";

// --- Tool definitions ---

const TOOLS = [
  {
    name: "gb_energy_search_regulations",
    description:
      "Search across British energy regulations from Ofgem, DESNZ, and HSE. Covers Electricity Act 1989, Gas Act 1986, Energy Act 2023, and related statutory instruments.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (e.g., 'electricity act', 'RIIO', 'capacity market', 'supplier obligation', 'net zero')" },
        regulator: { type: "string", enum: ["ofgem", "desnz", "hse"], description: "Filter by regulator. Optional." },
        type: { type: "string", enum: ["act", "statutory_instrument", "licence_condition", "guidance"], description: "Filter by regulation type. Optional." },
        status: { type: "string", enum: ["in_force", "repealed", "draft"], description: "Filter by status. Defaults to all." },
        limit: { type: "number", description: "Maximum results (default 20, max 100)." },
      },
      required: ["query"],
    },
  },
  {
    name: "gb_energy_get_regulation",
    description:
      "Get a specific British energy regulation by its reference string (e.g., 'Electricity Act 1989 c.29'). Returns full text.",
    inputSchema: {
      type: "object" as const,
      properties: {
        reference: { type: "string", description: "Regulation reference (e.g., 'Electricity Act 1989 c.29')" },
      },
      required: ["reference"],
    },
  },
  {
    name: "gb_energy_search_grid_codes",
    description:
      "Search NESO grid codes (Grid Code, CUSC, BSC, STC, DCUSA, SQSS), balancing rules, and connection requirements.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (e.g., 'balancing', 'grid code', 'connection', 'frequency response', 'capacity market')" },
        code_type: { type: "string", enum: ["grid_code", "industry_code", "connection_requirement", "balancing", "ancillary_services"], description: "Filter by code type. Optional." },
        limit: { type: "number", description: "Maximum results (default 20, max 100)." },
      },
      required: ["query"],
    },
  },
  {
    name: "gb_energy_get_grid_code",
    description:
      "Get a specific NESO grid code document by its database ID. Returns full text.",
    inputSchema: {
      type: "object" as const,
      properties: {
        document_id: { type: "number", description: "Grid code document ID (from search results)" },
      },
      required: ["document_id"],
    },
  },
  {
    name: "gb_energy_search_decisions",
    description:
      "Search Ofgem price control determinations (RIIO), market reform decisions, supplier licensing, and enforcement actions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (e.g., 'price control', 'RIIO-ED2', 'supplier of last resort', 'CfD allocation', 'network tariff')" },
        decision_type: { type: "string", enum: ["price_control", "market_reform", "licensing", "enforcement", "network_tariff", "consumer_protection"], description: "Filter by decision type. Optional." },
        limit: { type: "number", description: "Maximum results (default 20, max 100)." },
      },
      required: ["query"],
    },
  },
  {
    name: "gb_energy_about",
    description:
      "British energy regulation MCP server. Covers Ofgem (RIIO price controls and market reform), NESO (grid codes and capacity market), DESNZ (energy policy and CfD), and HSE (offshore and gas safety).",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "gb_energy_list_sources",
    description:
      "List data sources with record counts, provenance URLs, and last refresh dates.",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "gb_energy_check_data_freshness",
    description:
      "Check data freshness for each source. Reports staleness and provides update instructions.",
    inputSchema: { type: "object" as const, properties: {}, required: [] },
  },
];

// --- Zod schemas ---

const SearchRegulationsArgs = z.object({
  query: z.string().min(1),
  regulator: z.enum(["ofgem", "desnz", "hse"]).optional(),
  type: z.enum(["act", "statutory_instrument", "licence_condition", "guidance"]).optional(),
  status: z.enum(["in_force", "repealed", "draft"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const GetRegulationArgs = z.object({ reference: z.string().min(1) });

const SearchGridCodesArgs = z.object({
  query: z.string().min(1),
  code_type: z.enum(["grid_code", "industry_code", "connection_requirement", "balancing", "ancillary_services"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const GetGridCodeArgs = z.object({ document_id: z.number().int().positive() });

const SearchDecisionsArgs = z.object({
  query: z.string().min(1),
  decision_type: z.enum(["price_control", "market_reform", "licensing", "enforcement", "network_tariff", "consumer_protection"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// --- Helpers ---

let _cachedBuildDate: string | null = null;

function dbBuildDate(): string {
  if (_cachedBuildDate) return _cachedBuildDate;
  try {
    _cachedBuildDate = getMetadataValue("build_date") ?? "unknown";
  } catch {
    _cachedBuildDate = "unknown";
  }
  return _cachedBuildDate;
}

function makeMeta() {
  return {
    _meta: {
      disclaimer:
        "Reference data only — not legal or regulatory advice. Verify against official sources.",
      data_source:
        "British energy regulators (ofgem.gov.uk, nationalgrideso.com, gov.uk/desnz, hse.gov.uk)",
      database_built: dbBuildDate(),
    },
  };
}

function textContent(data: unknown) {
  const payload =
    data !== null && typeof data === "object" && !Array.isArray(data)
      ? { ...(data as unknown as Record<string, unknown>), ...makeMeta() }
      : { data, ...makeMeta() };
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(payload, null, 2) },
    ],
  };
}

function errorContent(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: message, ...makeMeta() }, null, 2),
      },
    ],
    isError: true as const,
  };
}

// --- Server setup ---

const server = new Server(
  { name: SERVER_NAME, version: pkgVersion },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "gb_energy_search_regulations": {
        const parsed = SearchRegulationsArgs.parse(args);
        const results = searchRegulations({
          query: parsed.query,
          regulator: parsed.regulator,
          type: parsed.type,
          status: parsed.status,
          limit: parsed.limit,
        });
        return textContent({ results, count: results.length });
      }

      case "gb_energy_get_regulation": {
        const parsed = GetRegulationArgs.parse(args);
        const regulation = getRegulationByReference(parsed.reference);
        if (!regulation) {
          return errorContent(`Regulation not found: ${parsed.reference}`);
        }
        return textContent({
          ...(typeof regulation === 'object' ? regulation : { data: regulation }),
          _citation: buildCitation(
            regulation.reference || parsed.reference,
            regulation.title || regulation.name || parsed.reference,
            'gb_energy_get_regulation',
            { reference: parsed.reference },
            regulation.url || regulation.source_url || null,
          ),
        });
      }

      case "gb_energy_search_grid_codes": {
        const parsed = SearchGridCodesArgs.parse(args);
        const results = searchGridCodes({
          query: parsed.query,
          code_type: parsed.code_type,
          limit: parsed.limit,
        });
        return textContent({ results, count: results.length });
      }

      case "gb_energy_get_grid_code": {
        const parsed = GetGridCodeArgs.parse(args);
        const code = getGridCode(parsed.document_id);
        if (!code) {
          return errorContent(`Grid code not found: ID ${parsed.document_id}`);
        }
        return textContent({
          ...(typeof code === 'object' ? code : { data: code }),
          _citation: buildCitation(
            code.reference || code.code_ref || String(parsed.document_id),
            code.title || code.name || `Grid Code ${parsed.document_id}`,
            'gb_energy_get_grid_code',
            { document_id: String(parsed.document_id) },
            code.url || code.source_url || null,
          ),
        });
      }

      case "gb_energy_search_decisions": {
        const parsed = SearchDecisionsArgs.parse(args);
        const results = searchDecisions({
          query: parsed.query,
          decision_type: parsed.decision_type,
          limit: parsed.limit,
        });
        return textContent({ results, count: results.length });
      }

      case "gb_energy_about": {
        const regulators = listRegulators();
        return textContent({
          name: SERVER_NAME,
          version: pkgVersion,
          description:
            "British energy regulation MCP server. Covers Ofgem (RIIO price controls and market reform), NESO (grid codes and capacity market), DESNZ (energy policy and CfD), and HSE (offshore and gas safety).",
          regulators: regulators.map((r) => ({ id: r.id, name: r.name, url: r.url })),
          tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
        });
      }

      case "gb_energy_list_sources": {
        const counts = getRecordCounts();
        const sources = [
          { id: "ofgem", name: "Ofgem (Office of Gas and Electricity Markets)", url: "https://ofgem.gov.uk", record_count: getRegulationCountByRegulator("ofgem"), data_type: "regulations", last_refresh: dbBuildDate(), refresh_frequency: "quarterly" },
          { id: "neso", name: "NESO (National Energy System Operator)", url: "https://nationalgrideso.com", record_count: counts.grid_codes, data_type: "grid_codes", last_refresh: dbBuildDate(), refresh_frequency: "quarterly" },
          { id: "desnz", name: "DESNZ (Department for Energy Security and Net Zero)", url: "https://gov.uk/government/organisations/department-for-energy-security-and-net-zero", record_count: getRegulationCountByRegulator("desnz") + counts.decisions, data_type: "regulations + decisions", last_refresh: dbBuildDate(), refresh_frequency: "quarterly" },
          { id: "hse", name: "HSE Energy Division (Health and Safety Executive)", url: "https://hse.gov.uk/energy", record_count: getRegulationCountByRegulator("hse"), data_type: "regulations", last_refresh: dbBuildDate(), refresh_frequency: "quarterly" },
        ];
        return textContent({ sources, total_records: counts.regulations + counts.grid_codes + counts.decisions });
      }

      case "gb_energy_check_data_freshness": {
        const buildDate = dbBuildDate();
        const buildMs = buildDate !== "unknown" ? Date.parse(buildDate) : NaN;
        const nowMs = Date.now();
        const frequencyDays: Record<string, number> = { quarterly: 90 };
        const sourceEntries = [
          { source: "Ofgem (ofgem.gov.uk)", frequency: "quarterly" },
          { source: "NESO (nationalgrideso.com)", frequency: "quarterly" },
          { source: "DESNZ (gov.uk/desnz)", frequency: "quarterly" },
          { source: "HSE (hse.gov.uk/energy)", frequency: "quarterly" },
        ];
        const rows = sourceEntries.map((s) => {
          let status = "Unknown";
          if (!isNaN(buildMs)) {
            const thresholdMs = (frequencyDays[s.frequency] ?? 90) * 86_400_000;
            const ageMs = nowMs - buildMs;
            if (ageMs <= thresholdMs) { status = "Current"; }
            else if (ageMs <= thresholdMs * 1.5) { status = "Due"; }
            else { status = "OVERDUE"; }
          }
          return { source: s.source, last_refresh: buildDate, frequency: s.frequency, status };
        });
        const header = "| Source | Last Refresh | Frequency | Status |";
        const sep = "|---|---|---|---|";
        const tableRows = rows.map((r) => `| ${r.source} | ${r.last_refresh} | ${r.frequency} | ${r.status} |`);
        const table = [header, sep, ...tableRows].join("\n");
        const updateInstructions = "To refresh data, run: npx tsx scripts/ingest-all.ts --force";
        return textContent({ freshness_table: table, build_date: buildDate, update_instructions: updateInstructions, entries: rows });
      }

      default:
        return errorContent(`Unknown tool: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorContent(`Error in ${name}: ${message}`);
  }
});

// --- Main ---

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`${SERVER_NAME} v${pkgVersion} running on stdio\n`);
}

main().catch((err) => {
  process.stderr.write(
    `Fatal error: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
