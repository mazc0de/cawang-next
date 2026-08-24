with open("src/contexts/ProfileContext.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '    setProfiles((prev) => [...prev, data]);\n    return data;',
    '    setProfiles((prev) => [...prev, data]);\n    setActiveProfileIdState(data.id);\n    if (user) localStorage.setItem(`activeProfileId_${user.id}`, data.id);\n    return data;'
)

with open("src/contexts/ProfileContext.tsx", "w") as f:
    f.write(content)
