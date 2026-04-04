/**
 * Seed the British Energy Regulation database with sample data for testing.
 *
 * Inserts representative regulations, grid codes, and decisions from:
 *   - Ofgem (licence conditions, supplier obligations)
 *   - DESNZ (Energy Acts, statutory instruments)
 *   - NESO (Grid Code, BSC, CUSC)
 *   - HSE (offshore safety, gas safety)
 *
 * Usage:
 *   npx tsx scripts/seed-sample.ts
 *   npx tsx scripts/seed-sample.ts --force   # drop and recreate
 */

import Database from "better-sqlite3";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { SCHEMA_SQL } from "../src/db.js";

const DB_PATH = process.env["GB_ENERGY_DB_PATH"] ?? "data/gb-energy.db";
const force = process.argv.includes("--force");

const dir = dirname(DB_PATH);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

if (force && existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
  console.log(`Deleted existing database at ${DB_PATH}`);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA_SQL);

console.log(`Database initialised at ${DB_PATH}`);

// -- Regulators --

const regulators = [
  {
    id: "ofgem",
    name: "Ofgem",
    full_name: "Office of Gas and Electricity Markets (Ofgem)",
    url: "https://ofgem.gov.uk",
    description:
      "Ofgem — the independent energy regulator for Great Britain. Responsible for RIIO price controls, supplier licensing, consumer protection, market reform, and enforcement of licence conditions.",
  },
  {
    id: "neso",
    name: "NESO",
    full_name: "National Energy System Operator (NESO)",
    url: "https://nationalgrideso.com",
    description:
      "National Energy System Operator (formerly National Grid ESO) — manages the electricity system, maintains the Grid Code, CUSC, BSC, STC, DCUSA, and SQSS, and operates the balancing mechanism and capacity market.",
  },
  {
    id: "desnz",
    name: "DESNZ",
    full_name: "Department for Energy Security and Net Zero (DESNZ)",
    url: "https://gov.uk/government/organisations/department-for-energy-security-and-net-zero",
    description:
      "DESNZ — the UK government department responsible for energy policy, the Energy Act 2023, Contracts for Difference (CfD), net zero strategy, and energy security.",
  },
  {
    id: "hse",
    name: "HSE",
    full_name: "Health and Safety Executive, Energy Division (HSE)",
    url: "https://hse.gov.uk/energy",
    description:
      "HSE Energy Division — regulates offshore oil and gas safety, onshore gas safety, electrical safety at work, and the Pipelines Safety Regulations. Enforces the Health and Safety at Work etc. Act 1974 in the energy sector.",
  },
];

const insertRegulator = db.prepare(
  "INSERT OR IGNORE INTO regulators (id, name, full_name, url, description) VALUES (?, ?, ?, ?, ?)",
);

for (const r of regulators) {
  insertRegulator.run(r.id, r.name, r.full_name, r.url, r.description);
}
console.log(`Inserted ${regulators.length} regulators`);

// -- Regulations (Ofgem + DESNZ + HSE) --

const regulations = [
  // DESNZ — primary legislation
  {
    regulator_id: "desnz",
    reference: "Electricity Act 1989 c.29",
    title: "Electricity Act 1989",
    text: "An Act to provide for the privatisation of the electricity supply industry in England and Wales and for the reorganisation of the industry in Scotland. Establishes the licensing framework for electricity generation, transmission, distribution, and supply. Creates the regulatory framework administered by Ofgem (originally the Director General of Electricity Supply). Sets out duties regarding security of supply, promotion of competition, and protection of consumers. Amended by the Utilities Act 2000, Energy Act 2004, Energy Act 2008, Energy Act 2013, and Energy Act 2023.",
    type: "act",
    status: "in_force",
    effective_date: "1989-07-27",
    url: "https://www.legislation.gov.uk/ukpga/1989/29",
  },
  {
    regulator_id: "desnz",
    reference: "Gas Act 1986 c.44",
    title: "Gas Act 1986",
    text: "An Act to provide for the privatisation of the British Gas Corporation and for the regulation of the gas supply industry. Establishes the licensing framework for gas transportation, shipping, and supply. Creates the regulatory framework for the gas market administered by Ofgem. Sets out duties regarding security of gas supply and consumer protection. The Gas Act was substantially amended by the Gas Act 1995 and the Utilities Act 2000.",
    type: "act",
    status: "in_force",
    effective_date: "1986-07-25",
    url: "https://www.legislation.gov.uk/ukpga/1986/44",
  },
  {
    regulator_id: "desnz",
    reference: "Energy Act 2023 c.52",
    title: "Energy Act 2023",
    text: "An Act to make provision about the licensing of carbon dioxide transport and storage; about the regulation of hydrogen and carbon capture revenue support contracts; about new technology; about the Independent System Operator and Planner (ISOP, now NESO); about energy smart appliances and load control; about the energy performance of premises; about energy savings opportunity schemes; about heat networks; about the resilience of the core fuel sector; about offshore energy production; about nuclear energy; and for connected purposes. The largest energy legislation since the Energy Act 2013, establishing the framework for the National Energy System Operator (NESO), Great British Nuclear, and new regulatory powers for Ofgem over heat networks.",
    type: "act",
    status: "in_force",
    effective_date: "2023-10-26",
    url: "https://www.legislation.gov.uk/ukpga/2023/52",
  },
  {
    regulator_id: "desnz",
    reference: "SI 2014/2043",
    title: "The Electricity Capacity Regulations 2014",
    text: "Regulations establishing the Capacity Market in Great Britain. The Capacity Market is designed to ensure security of electricity supply by providing a payment to eligible capacity providers (generators, storage, demand-side response) in return for being available to deliver energy at times of system stress. The regulations set out the auction process, qualification requirements, capacity obligations, penalties for non-delivery, and the role of the Electricity Settlements Company. Amended multiple times, most recently by SI 2023/860.",
    type: "statutory_instrument",
    status: "in_force",
    effective_date: "2014-08-01",
    url: "https://www.legislation.gov.uk/uksi/2014/2043",
  },
  {
    regulator_id: "desnz",
    reference: "SI 2014/2042",
    title: "The Contracts for Difference (Allocation) Regulations 2014",
    text: "Regulations governing the allocation of Contracts for Difference (CfD) for low-carbon electricity generation. CfDs provide long-term revenue stabilisation for investment in new low-carbon generation (offshore wind, onshore wind, solar, nuclear, CCS, tidal). The regulations set out the allocation process, budget notices, application requirements, strike prices, and the role of the Low Carbon Contracts Company (LCCC). CfD Allocation Round 6 (AR6) opened in 2024.",
    type: "statutory_instrument",
    status: "in_force",
    effective_date: "2014-08-01",
    url: "https://www.legislation.gov.uk/uksi/2014/2042",
  },
  // Ofgem — licence conditions and guidance
  {
    regulator_id: "ofgem",
    reference: "SLC 25 Electricity Supply",
    title: "Standard Licence Condition 25: Informed Tariff Choices (Electricity Supply)",
    text: "Requires electricity suppliers to provide domestic customers with clear and accurate information about their tariffs. Suppliers must issue an annual statement showing the customer's current tariff, estimated annual cost, cheapest available tariff from the same supplier, and how to switch. Suppliers must not use complex or misleading tariff structures. Ofgem monitors compliance and can impose financial penalties for breaches.",
    type: "licence_condition",
    status: "in_force",
    effective_date: "2013-06-01",
    url: "https://www.ofgem.gov.uk/licences-industry-codes-and-standards/licences/licence-conditions",
  },
  {
    regulator_id: "ofgem",
    reference: "Ofgem/2024/RIIO-ED2/FD",
    title: "RIIO-ED2 Final Determinations: Electricity Distribution Price Control 2023-2028",
    text: "Ofgem's final determinations for the RIIO-ED2 electricity distribution price control covering the period 2023 to 2028. Sets allowed revenue for the 6 distribution network operators (DNOs): UK Power Networks, Western Power Distribution (now NGED), Northern Powergrid, Scottish and Southern Electricity Networks, SP Energy Networks, and Electricity North West. Total allowed expenditure of approximately 23.7 billion pounds over 5 years. Includes incentive mechanisms for reliability, customer satisfaction, network investment, and net zero readiness.",
    type: "guidance",
    status: "in_force",
    effective_date: "2023-04-01",
    url: "https://www.ofgem.gov.uk/energy-policy-and-regulation/policy-and-regulatory-programmes/network-price-controls/riio-ed2",
  },
  // HSE — safety regulations
  {
    regulator_id: "hse",
    reference: "SI 2015/398",
    title: "The Offshore Installations (Offshore Safety Directive) (Safety Case etc.) Regulations 2015",
    text: "Regulations implementing the EU Offshore Safety Directive (2013/30/EU) in UK law. Requires operators of offshore oil and gas installations to prepare safety cases demonstrating that risks have been reduced to as low as reasonably practicable (ALARP). The safety case must identify major accident hazards, describe the safety management system, and set out emergency response arrangements. HSE must accept the safety case before operations can commence. Also establishes requirements for well operations and combined operations.",
    type: "statutory_instrument",
    status: "in_force",
    effective_date: "2015-07-19",
    url: "https://www.legislation.gov.uk/uksi/2015/398",
  },
  {
    regulator_id: "hse",
    reference: "SI 1996/825",
    title: "The Pipelines Safety Regulations 1996",
    text: "Regulations establishing safety requirements for pipelines used to convey dangerous fluids, including natural gas, LPG, and other hydrocarbons. Pipeline operators must notify HSE of pipeline construction, ensure pipelines are designed and constructed to appropriate standards, maintain the pipeline in safe condition, and have an emergency plan. Major Accident Prevention Documents (MAPDs) are required for major accident hazard pipelines. HSE enforces compliance through inspection and enforcement.",
    type: "statutory_instrument",
    status: "in_force",
    effective_date: "1996-03-25",
    url: "https://www.legislation.gov.uk/uksi/1996/825",
  },
];

const insertRegulation = db.prepare(`
  INSERT INTO regulations (regulator_id, reference, title, text, type, status, effective_date, url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertRegsAll = db.transaction(() => {
  for (const r of regulations) {
    insertRegulation.run(
      r.regulator_id, r.reference, r.title, r.text, r.type, r.status, r.effective_date, r.url,
    );
  }
});
insertRegsAll();
console.log(`Inserted ${regulations.length} regulations`);

// -- Grid codes (NESO) --

const gridCodes = [
  {
    reference: "GC-OC6",
    title: "Grid Code — Operating Code No. 6: Demand Forecasting",
    text: "Operating Code No. 6 of the Grid Code sets out the obligations of NESO and Users regarding demand forecasting. NESO must prepare and publish demand forecasts for the GB electricity system. Distribution Network Operators (DNOs) must provide NESO with demand data and forecasts for their areas. The code specifies the format, timing, and granularity of demand forecasts, which are used for system planning, balancing, and adequacy assessment.",
    code_type: "grid_code",
    version: "5.0",
    effective_date: "2023-04-01",
    url: "https://www.nationalgrideso.com/industry-information/codes/grid-code",
  },
  {
    reference: "BSC P462",
    title: "Balancing and Settlement Code Modification P462: Faster Switching",
    text: "BSC Modification P462 implements the faster switching arrangements for electricity supply. Reduces the switching time for electricity customers from 2-3 weeks to next working day. Requires changes to settlement processes, meter data collection, and registration systems. The modification aligns the BSC with Ofgem's Switching Programme and the Retail Energy Code (REC). Implementation was phased, with full completion in July 2024.",
    code_type: "industry_code",
    version: "1.0",
    effective_date: "2024-07-01",
    url: "https://www.elexon.co.uk/mod-proposal/p462/",
  },
  {
    reference: "CUSC Section 14",
    title: "Connection and Use of System Code — Section 14: Charging Methodologies",
    text: "Section 14 of the CUSC sets out the charging methodologies for connection to and use of the National Electricity Transmission System (NETS). Covers Transmission Network Use of System (TNUoS) charges, Balancing Services Use of System (BSUoS) charges, and connection charges. TNUoS charges are locational, reflecting the cost of the transmission network at different points. BSUoS charges recover the costs of balancing the system. Methodology is subject to Ofgem approval.",
    code_type: "industry_code",
    version: "2.0",
    effective_date: "2023-04-01",
    url: "https://www.nationalgrideso.com/industry-information/codes/cusc",
  },
];

const insertGridCode = db.prepare(`
  INSERT INTO grid_codes (reference, title, text, code_type, version, effective_date, url)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertGridAll = db.transaction(() => {
  for (const g of gridCodes) {
    insertGridCode.run(g.reference, g.title, g.text, g.code_type, g.version, g.effective_date, g.url);
  }
});
insertGridAll();
console.log(`Inserted ${gridCodes.length} grid codes`);

// -- Decisions (Ofgem) --

const decisions = [
  {
    reference: "Ofgem/2022/RIIO-T2/FD",
    title: "RIIO-T2 Final Determinations: Electricity and Gas Transmission Price Control 2021-2026",
    text: "Ofgem's final determinations for the RIIO-T2 transmission price control. Sets allowed revenue for National Grid Electricity Transmission (NGET), Scottish Hydro Electric Transmission (SHE-T), SP Transmission (SPT), and National Gas Transmission (NGT). Total allowed expenditure of approximately 25 billion pounds over 5 years. Includes output delivery incentives, innovation funding, uncertainty mechanisms for net zero investment, and whole-system coordination requirements.",
    decision_type: "price_control",
    date_decided: "2022-12-16",
    parties: "NGET, SHE-T, SPT, NGT",
    url: "https://www.ofgem.gov.uk/energy-policy-and-regulation/policy-and-regulatory-programmes/network-price-controls/riio-t2",
  },
  {
    reference: "Ofgem/2024/SoLR/Bulb",
    title: "Supplier of Last Resort: Bulb Energy Limited — Final Report",
    text: "Ofgem's final report on the special administration of Bulb Energy Limited, which entered the Supplier of Last Resort (SoLR) process in November 2021. Bulb had approximately 1.5 million customers at the time of failure. The special administration was the first use of the energy supply company special administration regime under the Energy Act 2011. Octopus Energy completed the acquisition of Bulb's customers in December 2022. Total cost to consumers estimated at 6.5 billion pounds through energy supplier levy.",
    decision_type: "market_reform",
    date_decided: "2024-03-15",
    parties: "Bulb Energy Limited, Octopus Energy",
    url: "https://www.ofgem.gov.uk/information-for-household-consumers/bulb-special-administration",
  },
  {
    reference: "Ofgem/2024/ENF/001",
    title: "Enforcement action: Provisional order against supplier for billing failures",
    text: "Ofgem issued a provisional order under section 25 of the Electricity Act 1989 against an electricity supplier for systemic failures in billing accuracy and complaint handling. The supplier failed to issue accurate bills to approximately 120,000 customers over a 2-year period, resulting in significant back-billing. Ofgem found breaches of Standard Licence Conditions 21B (accurate bills) and 25 (informed tariff choices). The supplier agreed to a voluntary redress payment of 10.5 million pounds and a comprehensive remediation plan.",
    decision_type: "enforcement",
    date_decided: "2024-06-01",
    parties: "Supplier (anonymised pending final order)",
    url: "https://www.ofgem.gov.uk/enforcement/investigations",
  },
];

const insertDecision = db.prepare(`
  INSERT INTO decisions (reference, title, text, decision_type, date_decided, parties, url)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertDecAll = db.transaction(() => {
  for (const d of decisions) {
    insertDecision.run(d.reference, d.title, d.text, d.decision_type, d.date_decided, d.parties, d.url);
  }
});
insertDecAll();
console.log(`Inserted ${decisions.length} decisions`);

// -- Summary --

const stats = {
  regulators: (db.prepare("SELECT count(*) as cnt FROM regulators").get() as { cnt: number }).cnt,
  regulations: (db.prepare("SELECT count(*) as cnt FROM regulations").get() as { cnt: number }).cnt,
  grid_codes: (db.prepare("SELECT count(*) as cnt FROM grid_codes").get() as { cnt: number }).cnt,
  decisions: (db.prepare("SELECT count(*) as cnt FROM decisions").get() as { cnt: number }).cnt,
  regulations_fts: (db.prepare("SELECT count(*) as cnt FROM regulations_fts").get() as { cnt: number }).cnt,
  grid_codes_fts: (db.prepare("SELECT count(*) as cnt FROM grid_codes_fts").get() as { cnt: number }).cnt,
  decisions_fts: (db.prepare("SELECT count(*) as cnt FROM decisions_fts").get() as { cnt: number }).cnt,
};

console.log(`\nDatabase summary:`);
console.log(`  Regulators:       ${stats.regulators}`);
console.log(`  Regulations:      ${stats.regulations} (FTS: ${stats.regulations_fts})`);
console.log(`  Grid codes:       ${stats.grid_codes} (FTS: ${stats.grid_codes_fts})`);
console.log(`  Decisions:        ${stats.decisions} (FTS: ${stats.decisions_fts})`);
console.log(`\nDone. Database ready at ${DB_PATH}`);

db.close();
