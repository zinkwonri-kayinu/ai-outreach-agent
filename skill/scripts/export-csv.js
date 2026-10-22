#!/usr/bin/env node
// Turns drafted outreach rows into a CSV, and refuses to write it if any
// message breaks the rules. Usage: node export-csv.js rows.json out.csv
//
// rows.json is an array of objects:
//   { full_name, email, subject_1, message_1, subject_2, message_2, linkedin_dm }

const fs = require("fs");

const COLUMNS = ["full_name", "email", "subject_1", "message_1", "subject_2", "message_2", "linkedin_dm"];
const LIMITS = { message_1: 80, message_2: 80, linkedin_dm: 40 }; // word count must be below
const BANNED = /\b(leverage|streamline|seamless|robust|delve|cutting-edge|pivotal|transformative|landscape|furthermore)\b/i;

const [inPath, outPath] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error("Usage: node export-csv.js rows.json out.csv");
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(inPath, "utf8"));
const wordCount = (s) => s.trim().split(/\s+/).length;
const errors = [];

for (const row of rows) {
  const who = row.full_name || row.email;
  for (const [field, limit] of Object.entries(LIMITS)) {
    const text = row[field];
    if (!text) continue; // linkedin_dm is optional
    const n = wordCount(text);
    if (n >= limit) errors.push(`${who}: ${field} is ${n} words (limit < ${limit})`);
  }
  for (const field of COLUMNS) {
    const text = row[field] || "";
    if (text.includes("—")) errors.push(`${who}: ${field} contains an em dash`);
    const hit = text.match(BANNED);
    if (hit) errors.push(`${who}: ${field} uses banned word "${hit[0]}"`);
  }
  console.log(
    `${who}: message_1 ${wordCount(row.message_1 || "")}w, message_2 ${wordCount(row.message_2 || "")}w` +
      (row.linkedin_dm ? `, dm ${wordCount(row.linkedin_dm)}w` : "")
  );
}

if (errors.length) {
  console.error("\nNot written. Fix these first:\n- " + errors.join("\n- "));
  process.exit(1);
}

const cell = (s) => '"' + String(s ?? "").replace(/"/g, '""') + '"';
const lines = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))];
// BOM so Excel opens UTF-8 correctly; CRLF so multi-line cells behave in Excel and Sheets.
fs.writeFileSync(outPath, "﻿" + lines.join("\r\n") + "\r\n");
console.log(`\nWrote ${rows.length} rows to ${outPath}`);
