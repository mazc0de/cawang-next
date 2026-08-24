import re

with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()

new_delete = """      if (activeProfileId === id && newProfiles.length > 0) {
        setActiveProfileIdState(newProfiles[0].id);
        localStorage.setItem(`activeProfileId_${user.id}`, newProfiles[0].id);
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }"""

content = content.replace(
    '      if (activeProfileId === id && newProfiles.length > 0) {\n        setActiveProfileIdState(newProfiles[0].id);\n        localStorage.setItem(`activeProfileId_${user.id}`, newProfiles[0].id);\n      }',
    new_delete
)

with open("src/contexts/ProfileContext.tsx", "w") as f:
    f.write(content)
