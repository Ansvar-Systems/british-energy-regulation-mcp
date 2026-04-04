# Coverage -- British Energy Regulation MCP

Current coverage of British energy sector regulatory data.

**Last updated:** 2026-04-04

---

## Sources

| Source | Authority | Records | Content |
|--------|-----------|---------|---------|
| **DESNZ** | Department for Energy Security and Net Zero | 160 regulations | Energy Act 2023, net zero strategy, CfD scheme, capacity market, hydrogen strategy |
| **Ofgem** | Office of Gas and Electricity Markets | 72 regulations | RIIO price controls, licence conditions, supplier obligations, consumer protection |
| **HSE** | Health and Safety Executive | 37 regulations | Offshore safety, gas safety, nuclear safety, COMAH regulations |
| **NESO** | National Energy System Operator | 74 grid codes | Grid Code, CUSC, BSC, STC, DCUSA, SQSS, balancing, ancillary services |
| **Ofgem (decisions)** | Office of Gas and Electricity Markets | 58 decisions | Price control determinations, market reform, enforcement, licensing, consumer protection |
| **Total** | | **401 records** | ~496 KB SQLite database |

---

## Regulation Types

| Type | Description | Count | Regulators |
|------|-------------|-------|------------|
| `act` | Act of Parliament (e.g., Electricity Act 1989, Energy Act 2023) | 84 | DESNZ |
| `guidance` | Regulatory guidance and policy documents | 78 | Ofgem, DESNZ, HSE |
| `statutory_instrument` | Statutory Instruments (secondary legislation) | 63 | DESNZ |
| `licence_condition` | Licence conditions for generation, supply, and distribution | 44 | Ofgem |

## Grid Code Types

| Type | Description | Count |
|------|-------------|-------|
| `industry_code` | Industry codes (BSC, CUSC, DCUSA, STC, SEC, MRA) | 33 |
| `grid_code` | Grid Code sections (planning, connection, operating) | 31 |
| `ancillary_services` | Ancillary services (frequency response, reserve, reactive power) | 9 |
| `connection_requirement` | Connection and Use of System requirements | 1 |

## Decision Types

| Type | Description | Count |
|------|-------------|-------|
| `market_reform` | Market reform decisions (CfD, capacity market, REMA) | 16 |
| `enforcement` | Enforcement actions and compliance investigations | 15 |
| `price_control` | Price control determinations (RIIO-ED2, RIIO-GD2, RIIO-T2) | 11 |
| `consumer_protection` | Consumer protection decisions and supplier obligations | 6 |
| `licensing` | Supplier licensing and supplier of last resort decisions | 6 |
| `network_tariff` | Network tariff decisions and Use of System charging | 4 |

---

## What Is NOT Included

This is a seed dataset. The following are not yet covered:

- **Full text of original documents** -- records contain summaries, not complete legal text from legislation.gov.uk
- **Court decisions** -- Competition Appeal Tribunal and High Court energy rulings are not included
- **Historical and repealed regulations** -- only current in-force regulations are covered
- **EU retained energy law** -- post-Brexit retained EU energy law is not separately tracked
- **Parliamentary proceedings** -- House of Commons energy debates and committee reports are not included
- **Devolved legislation** -- Scottish and Welsh energy legislation is not covered
- **Individual tariff schedules** -- utility-specific tariff sheets are not included (only Ofgem approval decisions)

---

## Limitations

- **Seed dataset** -- 401 records across regulations, grid codes, and decisions
- **English text** -- all content is in English
- **Summaries, not full legal text** -- records contain representative summaries, not the complete official text from legislation.gov.uk or regulator websites.
- **Quarterly manual refresh** -- data is updated manually. Recent regulatory changes may not be reflected.
- **No real-time tracking** -- amendments and repeals are not tracked automatically.

---

## Planned Improvements

Full automated ingestion is planned from:

- **legislation.gov.uk** -- UK legislation (Acts, Statutory Instruments)
- **ofgem.gov.uk** -- Ofgem decisions, RIIO price controls, licence conditions, enforcement actions
- **nationalgrideso.com** -- NESO grid codes, balancing services, connection requirements
- **gov.uk/desnz** -- DESNZ energy policy, CfD, capacity market, net zero strategy
- **hse.gov.uk** -- HSE energy safety regulations, offshore safety, COMAH

---

## Language

All content is in English. The following search terms are useful starting points:

| Term | Context |
|------|---------|
| electricity act | Primary legislation (Electricity Act 1989, Energy Act 2023) |
| RIIO | Revenue = Incentives + Innovation + Outputs (price control framework) |
| capacity market | GB capacity market for security of supply |
| CfD | Contracts for Difference (renewable energy support) |
| grid code | GB Grid Code (connection, planning, operating codes) |
| balancing | Balancing mechanism and settlement (BSC) |
| frequency response | Dynamic and static frequency response services |
| supplier obligation | Energy company obligation (ECO), warm home discount |
| net zero | Net Zero strategy and carbon budgets |
| offshore | Offshore wind, offshore safety, decommissioning |
| CUSC | Connection and Use of System Code |
| DCUSA | Distribution Connection and Use of System Agreement |
| network tariff | Use of System charges, DUoS, TNUoS |
| supplier of last resort | SoLR process for failed suppliers |
