import re

with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()

new_set = """  const setActiveProfileId = (id: string) => {
    if (id !== activeProfileId) {
      setActiveProfileIdState(id);
      if (user) {
        localStorage.setItem(`activeProfileId_${user.id}`, id);
      }
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };"""

content = re.sub(
    r'  const setActiveProfileId = \(id: string\) => \{\n    setActiveProfileIdState\(id\);\n    if \(user\) \{\n      localStorage\.setItem\(`activeProfileId_\$\{user\.id\}`, id\);\n    \}\n  \};',
    new_set,
    content
)

# And for createProfile
new_create = """    setProfiles((prev) => [...prev, data]);
    setActiveProfileIdState(data.id);
    if (user) localStorage.setItem(`activeProfileId_${user.id}`, data.id);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return data;"""

content = content.replace(
    '    setProfiles((prev) => [...prev, data]);\n    setActiveProfileIdState(data.id);\n    if (user) localStorage.setItem(`activeProfileId_${user.id}`, data.id);\n    return data;',
    new_create
)

with open("src/contexts/ProfileContext.tsx", "w") as f:
    f.write(content)
