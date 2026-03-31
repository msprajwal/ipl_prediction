// Mapping of standard IPL team abbreviations or names to external logo URLs
// We use high-quality, transparent Wikipedia/Wikimedia or sports CDN images to prevent bloating the repository.

const TeamLogos = {
    'CSK': 'https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg',
    'Chennai Super Kings': 'https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg',
    
    'MI': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Mumbai_Indians_Logo.svg',
    'Mumbai Indians': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Mumbai_Indians_Logo.svg',
    
    'RCB': 'https://upload.wikimedia.org/wikipedia/en/2/2a/Royal_Challengers_Bengaluru_Logo.png',
    'Royal Challengers Bangalore': 'https://upload.wikimedia.org/wikipedia/en/2/2a/Royal_Challengers_Bengaluru_Logo.png',
    
    'KKR': 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg',
    'Kolkata Knight Riders': 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg',
    
    'DC': 'https://upload.wikimedia.org/wikipedia/en/f/f5/Delhi_Capitals_Logo.svg',
    'Delhi Capitals': 'https://upload.wikimedia.org/wikipedia/en/f/f5/Delhi_Capitals_Logo.svg',
    
    'RR': 'https://upload.wikimedia.org/wikipedia/en/6/60/Rajasthan_Royals_Logo.svg',
    'Rajasthan Royals': 'https://upload.wikimedia.org/wikipedia/en/6/60/Rajasthan_Royals_Logo.svg',
    
    'SRH': 'https://upload.wikimedia.org/wikipedia/en/8/81/Sunrisers_Hyderabad.svg',
    'Sunrisers Hyderabad': 'https://upload.wikimedia.org/wikipedia/en/8/81/Sunrisers_Hyderabad.svg',
    
    'PBKS': 'https://upload.wikimedia.org/wikipedia/en/d/d4/Punjab_Kings_Logo.svg',
    'Punjab Kings': 'https://upload.wikimedia.org/wikipedia/en/d/d4/Punjab_Kings_Logo.svg',
    
    'GT': 'https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg',
    'Gujarat Titans': 'https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg',
    
    'LSG': 'https://upload.wikimedia.org/wikipedia/en/a/a9/Lucknow_Super_Giants_IPL_Logo.svg',
    'Lucknow Super Giants': 'https://upload.wikimedia.org/wikipedia/en/a/a9/Lucknow_Super_Giants_IPL_Logo.svg',
};

/**
 * Helper function to retrieve a team's logo URL safely
 * @param {string} teamName - The name or abbreviation of the team
 * @returns {string|null} - The URL of the logo, or null if unknown
 */
export const getTeamLogo = (teamName) => {
    if (!teamName) return null;
    
    // Attempt exact match
    if (TeamLogos[teamName]) return TeamLogos[teamName];
    
    // Attempt relaxed match (trim whitespace, uppercase)
    const normalized = teamName.toUpperCase().trim();
    return TeamLogos[normalized] || null;
};

export default TeamLogos;
