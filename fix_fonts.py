import sys

with open('src/themes/MinangElegantTheme.jsx', 'r') as f:
    lines = f.readlines()

for i in range(len(lines)):
    # Profile
    if "fontFamily: 'Cormorant Infant, serif', fontSize: '2rem'" in lines[i] and 'italic' in lines[i]:
        lines[i] = lines[i].replace("fontSize: '2rem'", "fontSize: '2.2rem'")
    # Countdown
    elif "fontSize: '1.6rem'" in lines[i] and 'italic' in lines[i]:
        lines[i] = lines[i].replace("fontSize: '1.6rem'", "fontSize: '2.2rem'")
    # Wish
    elif "fontSize: '1.6rem'" in lines[i] and 'italic' in lines[i]:
        lines[i] = lines[i].replace("fontSize: '1.6rem'", "fontSize: '2.2rem'")
    # Dresscode
    elif "fontSize: '1.6rem'" in lines[i] and not 'italic' in lines[i] and 'Cormorant' in lines[i]:
        lines[i] = lines[i].replace("fontSize: '1.6rem', color: c.maroon", "fontSize: '2.2rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic'")
    # Gift & Turut
    elif "fontSize: '2.5rem'" in lines[i]:
        lines[i] = lines[i].replace("fontSize: '2.5rem', color: c.maroon", "fontSize: '2.2rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic'")
    # Events day
    elif "fontSize: '3.5rem'" in lines[i]:
        lines[i] = lines[i].replace("fontSize: '3.5rem'", "fontSize: '2.5rem'")

with open('src/themes/MinangElegantTheme.jsx', 'w') as f:
    f.writelines(lines)

print("Fonts standardized!")
