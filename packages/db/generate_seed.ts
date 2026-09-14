import { DEFAULT_VERIFIED_RESOURCES } from "./src/seed";

let sql = "";
for (const r of DEFAULT_VERIFIED_RESOURCES) {
  const hotline = r.hotline ? `'${r.hotline.replace(/'/g, "''")}'` : "NULL";
  const sms = r.smsText ? `'${r.smsText.replace(/'/g, "''")}'` : "NULL";
  const chat = r.secureChatUrl ? `'${r.secureChatUrl.replace(/'/g, "''")}'` : "NULL";
  const langs = `'${JSON.stringify(r.languages).replace(/'/g, "''")}'`;
  const name = `'${r.name.replace(/'/g, "''")}'`;
  const desc = `'${r.description.replace(/'/g, "''")}'`;
  const website = `'${r.website.replace(/'/g, "''")}'`;

  sql += `INSERT INTO verified_resources (id, name, description, country_code, region, hotline, sms_text, website, specialty, languages_json, free_and_confidential, secure_chat_url) VALUES ('${r.id}', ${name}, ${desc}, '${r.countryCode}', '${r.region}', ${hotline}, ${sms}, ${website}, '${r.specialty}', ${langs}, 1, ${chat}) ON CONFLICT(id) DO NOTHING;\n`;
}

await Bun.write("./packages/db/seed.sql", sql);
console.log("Seed SQL generated successfully for", DEFAULT_VERIFIED_RESOURCES.length, "resources.");
