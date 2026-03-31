// Mapping of standard IPL team abbreviations or names to external logo URLs
// We use high-quality, transparent Wikipedia/Wikimedia or sports CDN images to prevent bloating the repository.

const TeamLogos = {
    'CSK': 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png',
    'Chennai Super Kings': 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png',
    
    'MI': 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png',
    'Mumbai Indians': 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png',
    
    'RCB': 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png',
    'Royal Challengers Bangalore': 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png',
    'Royal Challengers Bengaluru': 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png',
    
    'KKR': 'https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png',
    'Kolkata Knight Riders': 'https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png',
    
    'DC': 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png',
    'Delhi Capitals': 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png',
    
    'RR': 'https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png',
    'Rajasthan Royals': 'https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png',
    
    'SRH': 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png',
    'Sunrisers Hyderabad': 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png',
    
    'PBKS': 'https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png',
    'Punjab Kings': 'https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png',
    
    'GT': 'https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png',
    'Gujarat Titans': 'https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png',
    
    'LSG': 'https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png',
    'Lucknow Super Giants': 'https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png',
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
