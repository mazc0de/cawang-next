import re

with open("src/lib/utils.ts", "r") as f:
    content = f.read()

new_formatRupiah = """export function formatRupiah(amount: number, compact = false): string {
  // compact behavior is disabled globally per user request
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}"""

content = re.sub(
    r'export function formatRupiah\(amount: number, compact = false\): string \{[\s\S]*?\}\.format\(amount\);\n\}',
    new_formatRupiah,
    content
)

with open("src/lib/utils.ts", "w") as f:
    f.write(content)
