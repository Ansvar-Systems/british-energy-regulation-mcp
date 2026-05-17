# British Energy Regulation MCP

<!-- ANSVAR-CTA-BEGIN -->
> ### ▶ Try this MCP instantly via Ansvar Gateway
> **50 free queries/day · no card required · OAuth signup at [ansvar.eu/gateway](https://ansvar.eu/gateway)**
>
> One endpoint, one OAuth signup, access from any MCP-compatible client.

### Connect

**Claude Code** (one line):

```bash
claude mcp add ansvar --transport http https://gateway.ansvar.eu/mcp
```

**Claude Desktop / Cursor** — add to `claude_desktop_config.json` (or `mcp.json`):

```json
{
  "mcpServers": {
    "ansvar": {
      "type": "url",
      "url": "https://gateway.ansvar.eu/mcp"
    }
  }
}
```

**Claude.ai** — Settings → Connectors → Add custom connector → paste `https://gateway.ansvar.eu/mcp`

First request opens an OAuth flow at [ansvar.eu/gateway](https://ansvar.eu/gateway). After signup, your client is bound to your account; tier (free / premium / team / company) determines fan-out, quota, and which downstream MCPs are reachable.

---

## Self-host this MCP

You can also clone this repo and build the corpus yourself. The schema,
fetcher, and tool implementations all live here. What is not in the repo is
the pre-built database — TDM and standards-licensing constraints on the
upstream sources mean we host the corpus on Ansvar infrastructure rather
than redistribute it as a public artifact.

Build your own: run this repo's ingestion script (entry-point varies per
repo — typically `scripts/ingest.sh`, `npm run ingest`, or `make ingest`;
check the repo root).
<!-- ANSVAR-CTA-END -->


MCP server for British energy sector regulations -- Ofgem RIIO price controls, NESO grid codes, DESNZ energy policy, HSE safety rules.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Covers four British energy regulators with full-text search across regulations, grid codes, and regulatory decisions. All data is in English.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Regulators Covered

| Regulator | Role | Website |
|-----------|------|---------|
| **Ofgem** (Office of Gas and Electricity Markets) | Energy market regulation, RIIO price controls, supplier licensing, consumer protection | [ofgem.gov.uk](https://ofgem.gov.uk) |
| **NESO** (National Energy System Operator) | Grid codes, balancing mechanism, capacity market, ancillary services, system planning | [nationalgrideso.com](https://nationalgrideso.com) |
| **DESNZ** (Department for Energy Security and Net Zero) | Energy policy, CfD, capacity market, net zero strategy, hydrogen | [gov.uk/desnz](https://gov.uk/government/organisations/department-for-energy-security-and-net-zero) |
| **HSE** (Health and Safety Executive, Energy Division) | Offshore safety, gas safety, nuclear safety, COMAH regulations | [hse.gov.uk](https://hse.gov.uk) |

---

## Tools

| Tool | Description |
|------|-------------|
| `gb_energy_search_regulations` | Full-text search across energy regulations from Ofgem, DESNZ, and HSE |
| `gb_energy_get_regulation` | Get a specific regulation by reference string (e.g., `Electricity Act 1989 c.29`) |
| `gb_energy_search_grid_codes` | Search NESO grid codes (Grid Code, CUSC, BSC, STC, DCUSA, SQSS) |
| `gb_energy_get_grid_code` | Get a specific grid code document by database ID |
| `gb_energy_search_decisions` | Search Ofgem price control determinations, enforcement actions, and market reform |
| `gb_energy_about` | Return server metadata: version, regulators, tool list, data coverage |
| `gb_energy_list_sources` | List data sources with record counts and provenance URLs |
| `gb_energy_check_data_freshness` | Check data freshness and staleness status for each source |

Full tool documentation: [TOOLS.md](TOOLS.md)

---

## Data Coverage

| Source | Records | Content |
|--------|---------|---------|
| DESNZ | 160 regulations | Energy Act 2023, net zero strategy, CfD, capacity market, hydrogen |
| Ofgem | 72 regulations | RIIO price controls, licence conditions, supplier obligations |
| HSE | 37 regulations | Offshore safety, gas safety, nuclear safety, COMAH |
| NESO | 74 grid codes | Grid Code, BSC, CUSC, DCUSA, STC, SQSS, ancillary services |
| Ofgem (decisions) | 58 decisions | Price controls, market reform, enforcement, licensing |
| **Total** | **401 records** | ~496 KB database |

**Language note:** All content is in English.

Full coverage details: [COVERAGE.md](COVERAGE.md)

---

## Data Sources

See [sources.yml](sources.yml) for machine-readable provenance metadata.

---

## Docker

```bash
docker build -t british-energy-regulation-mcp .
docker run --rm -p 3000:3000 -v /path/to/data:/app/data british-energy-regulation-mcp
```

Set `GB_ENERGY_DB_PATH` to use a custom database location (default: `data/gb-energy.db`).

---

## Development

```bash
npm install
npm run build
npm run seed         # populate sample data
npm run dev          # HTTP server on port 3000
```

---

## Further Reading

- [TOOLS.md](TOOLS.md) -- full tool documentation with examples
- [COVERAGE.md](COVERAGE.md) -- data coverage and limitations
- [sources.yml](sources.yml) -- data provenance metadata
- [DISCLAIMER.md](DISCLAIMER.md) -- legal disclaimer
- [PRIVACY.md](PRIVACY.md) -- privacy policy
- [SECURITY.md](SECURITY.md) -- vulnerability disclosure

---

## License

Apache-2.0 -- [Ansvar Systems AB](https://ansvar.eu)

See [LICENSE](LICENSE) for the full license text.

See [DISCLAIMER.md](DISCLAIMER.md) for important legal disclaimers about the use of this regulatory data.

---

[ansvar.ai/mcp](https://ansvar.ai/mcp) -- Full MCP server catalog
