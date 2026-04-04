# Tools -- British Energy Regulation MCP

8 tools for searching and retrieving British energy sector regulations.

All data is in English.

---

## 1. gb_energy_search_regulations

Search across British energy regulations from Ofgem, DESNZ, and HSE. Covers Electricity Act 1989, Gas Act 1986, Energy Act 2023, and related statutory instruments.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query (e.g., `electricity act`, `RIIO`, `capacity market`, `supplier obligation`, `net zero`) |
| `regulator` | string | No | Filter by regulator: `ofgem`, `desnz`, `hse` |
| `type` | string | No | Filter by regulation type: `act`, `statutory_instrument`, `licence_condition`, `guidance` |
| `status` | string | No | Filter by status: `in_force`, `repealed`, `draft`. Defaults to all. |
| `limit` | number | No | Maximum results (default 20, max 100) |

**Returns:** Array of matching regulations with reference, title, text, type, status, effective date, and URL.

**Example:**

```json
{
  "query": "capacity market",
  "regulator": "ofgem",
  "status": "in_force"
}
```

**Data sources:** Ofgem (ofgem.gov.uk), DESNZ (gov.uk/desnz), HSE (hse.gov.uk), legislation.gov.uk.

**Limitations:** Summaries, not full legal text.

---

## 2. gb_energy_get_regulation

Get a specific British energy regulation by its reference string. Returns the full record including text, metadata, and URL.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `reference` | string | Yes | Regulation reference (e.g., `Electricity Act 1989 c.29`) |

**Returns:** Single regulation record with all fields, or an error if not found.

**Example:**

```json
{
  "reference": "Electricity Act 1989 c.29"
}
```

**Data sources:** legislation.gov.uk, ofgem.gov.uk, gov.uk/desnz.

**Limitations:** Exact match on reference string. Partial matches are not supported -- use `gb_energy_search_regulations` for fuzzy search.

---

## 3. gb_energy_search_grid_codes

Search NESO grid codes (Grid Code, CUSC, BSC, STC, DCUSA, SQSS), balancing rules, and connection requirements.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query (e.g., `balancing`, `grid code`, `connection`, `frequency response`, `capacity market`) |
| `code_type` | string | No | Filter by code type: `grid_code`, `industry_code`, `connection_requirement`, `balancing`, `ancillary_services` |
| `limit` | number | No | Maximum results (default 20, max 100) |

**Returns:** Array of matching grid code documents with reference, title, text, code type, version, effective date, and URL.

**Example:**

```json
{
  "query": "frequency response",
  "code_type": "ancillary_services"
}
```

**Data sources:** NESO (nationalgrideso.com).

**Limitations:** Summaries of grid code sections, not the full documents.

---

## 4. gb_energy_get_grid_code

Get a specific NESO grid code document by its database ID. The ID is returned in search results from `gb_energy_search_grid_codes`.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `document_id` | number | Yes | Grid code document ID (from search results) |

**Returns:** Single grid code record with all fields, or an error if not found.

**Example:**

```json
{
  "document_id": 2
}
```

**Data sources:** NESO (nationalgrideso.com).

**Limitations:** Requires a valid database ID. Use `gb_energy_search_grid_codes` to find IDs.

---

## 5. gb_energy_search_decisions

Search Ofgem price control determinations (RIIO), market reform decisions, supplier licensing, and enforcement actions.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query (e.g., `price control`, `RIIO-ED2`, `supplier of last resort`, `CfD allocation`, `network tariff`) |
| `decision_type` | string | No | Filter by decision type: `price_control`, `market_reform`, `licensing`, `enforcement`, `network_tariff`, `consumer_protection` |
| `limit` | number | No | Maximum results (default 20, max 100) |

**Returns:** Array of matching decisions with reference, title, text, decision type, date decided, parties, and URL.

**Example:**

```json
{
  "query": "RIIO-ED2",
  "decision_type": "price_control"
}
```

**Data sources:** Ofgem (ofgem.gov.uk).

**Limitations:** Summaries of decisions, not full legal text.

---

## 6. gb_energy_about

Return metadata about this MCP server: version, list of regulators covered, tool list, and data coverage summary. Takes no parameters.

**Parameters:** None.

**Returns:** Server name, version, description, list of regulators (id, name, URL), and tool list (name, description).

**Example:**

```json
{}
```

**Data sources:** N/A (server metadata).

**Limitations:** None.

---

## 7. gb_energy_list_sources

List data sources with record counts, provenance URLs, and last refresh dates.

**Parameters:** None.

**Returns:** Array of data sources with id, name, URL, record count, data type, last refresh date, and refresh frequency.

**Example:**

```json
{}
```

**Data sources:** N/A (server metadata).

**Limitations:** None.

---

## 8. gb_energy_check_data_freshness

Check data freshness for each source. Reports staleness status and provides update instructions.

**Parameters:** None.

**Returns:** Freshness table with source, last refresh date, frequency, and status (Current/Due/OVERDUE).

**Example:**

```json
{}
```

**Data sources:** N/A (server metadata).

**Limitations:** None.
