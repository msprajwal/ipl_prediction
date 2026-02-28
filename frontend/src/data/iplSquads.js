// IPL 2026 Team Squads — Updated after IPL 2026 Mini Auction (Dec 2025)
const iplSquads = {
    CSK: [
        "Ruturaj Gaikwad", "MS Dhoni", "Sanju Samson", "Shivam Dube", "Dewald Brevis",
        "Ayush Mhatre", "Sarfaraz Khan", "Urvil Patel", "Kartik Sharma",
        "Jamie Overton", "Ramakrishna Ghosh", "Prashant Veer", "Matthew Short",
        "Aman Khan", "Zak Foulkes", "Noor Ahmad", "Khaleel Ahmed",
        "Anshul Kamboj", "Gurjapneet Singh", "Nathan Ellis", "Shreyas Gopal",
        "Mukesh Choudhary", "Akeal Hosein", "Matt Henry", "Rahul Chahar"
    ],
    MI: [
        "Hardik Pandya", "Rohit Sharma", "Suryakumar Yadav", "Tilak Varma",
        "Jasprit Bumrah", "Trent Boult", "Ryan Rickelton", "Quinton de Kock",
        "Naman Dhir", "Will Jacks", "Robin Minz", "Raj Angad Bawa",
        "Raghu Sharma", "Mitchell Santner", "Allah Ghazanfar", "Ashwani Kumar",
        "Deepak Chahar", "Corbin Bosch", "Shardul Thakur", "Sherfane Rutherford",
        "Mayank Markande", "Danish Malewar", "Atharva Ankolekar", "Mayank Rawat",
        "Mohammad Izhar"
    ],
    RCB: [
        "Virat Kohli", "Rajat Patidar", "Phil Salt", "Devdutt Padikkal",
        "Jitesh Sharma", "Tim David", "Krunal Pandya", "Venkatesh Iyer",
        "Swapnil Singh", "Romario Shepherd", "Jacob Bethell", "Josh Hazlewood",
        "Yash Dayal", "Bhuvneshwar Kumar", "Nuwan Thushara", "Rasikh Salam",
        "Abhinandan Singh", "Suyash Sharma", "Jacob Duffy", "Satvik Deswal",
        "Mangesh Yadav", "Jordan Cox", "Vicky Ostwal", "Vihaan Malhotra",
        "Kanishk Chouhan"
    ],
    KKR: [
        "Rinku Singh", "Ajinkya Rahane", "Sunil Narine", "Varun Chakravarthy",
        "Angkrish Raghuvanshi", "Manish Pandey", "Rovman Powell", "Ramandeep Singh",
        "Anukul Roy", "Harshit Rana", "Vaibhav Arora", "Umran Malik",
        "Cameron Green", "Finn Allen", "Matheesha Pathirana", "Tejasvi Singh",
        "Kartik Tyagi", "Prashant Solanki", "Rahul Tripathi", "Tim Seifert",
        "Mustafizur Rahman", "Sarthak Ranjan", "Daksh Kamra", "Rachin Ravindra",
        "Akash Deep"
    ],
    DC: [
        "Axar Patel", "KL Rahul", "Abishek Porel", "Tristan Stubbs",
        "Karun Nair", "Sameer Rizvi", "Nitish Rana", "David Miller",
        "Ben Duckett", "Prithvi Shaw", "Ashutosh Sharma", "Vipraj Nigam",
        "Madhav Tiwari", "Tripurana Vijay", "Ajay Mandal", "Kuldeep Yadav",
        "Mitchell Starc", "T Natarajan", "Mukesh Kumar", "Dushmantha Chameera",
        "Lungi Ngidi", "Auqib Nabi Dar", "Pathum Nissanka", "Sahil Parakh",
        "Kyle Jamieson"
    ],
    SRH: [
        "Pat Cummins", "Travis Head", "Abhishek Sharma", "Ishan Kishan",
        "Heinrich Klaasen", "Nitish Kumar Reddy", "Harshal Patel",
        "Liam Livingstone", "Kamindu Mendis", "Brydon Carse", "Aniket Verma",
        "R Smaran", "Harsh Dubey", "Jaydev Unadkat", "Eshan Malinga",
        "Zeeshan Ansari", "Shivang Kumar", "Sakib Hussain", "Salil Arora",
        "Onkar Tarmale", "Amit Kumar", "Shivam Mavi", "Jack Edwards"
    ],
    GT: [
        "Shubman Gill", "Rashid Khan", "Sai Sudharsan", "Jos Buttler",
        "Kagiso Rabada", "Mohammed Siraj", "Shahrukh Khan", "Rahul Tewatia",
        "Washington Sundar", "Kumar Kushagra", "Anuj Rawat", "Nishant Sindhu",
        "Arshad Khan", "Prasidh Krishna", "Ishant Sharma", "Gurnoor Singh Brar",
        "Manav Suthar", "Sai Kishore", "Jayant Yadav", "Jason Holder",
        "Tom Banton", "Ashok Sharma", "Prithvi Raj Yarra", "Glenn Phillips"
    ],
    LSG: [
        "Rishabh Pant", "Nicholas Pooran", "Mitchell Marsh", "Aiden Markram",
        "Ayush Badoni", "Abdul Samad", "Matthew Breetzke", "Himmat Singh",
        "Shahbaz Ahmed", "Arshin Kulkarni", "Mayank Yadav", "Avesh Khan",
        "Mohsin Khan", "Mohammed Shami", "Wanindu Hasaranga", "Anrich Nortje",
        "Josh Inglis", "Arjun Tendulkar", "Manimaran Siddharth", "Digvesh Rathi",
        "Prince Yadav", "Akash Singh", "Mukul Choudhary", "Naman Tiwari",
        "Akshat Raghuwanshi"
    ],
    PBKS: [
        "Shreyas Iyer", "Marcus Stoinis", "Arshdeep Singh", "Yuzvendra Chahal",
        "Prabhsimran Singh", "Shashank Singh", "Nehal Wadhera", "Harpreet Brar",
        "Priyansh Arya", "Azmatullah Omarzai", "Vijaykumar Vyshak",
        "Suryansh Shedge", "Vishnu Vinod", "Xavier Bartlett", "Yash Thakur",
        "Mitchell Owen", "Harnoor Singh", "Musheer Khan", "Pyla Avinash",
        "Marco Jansen", "Lockie Ferguson", "Cooper Connolly", "Ben Dwarshuis",
        "Pravin Dubey", "Vishal Nishad"
    ],
    RR: [
        "Yashasvi Jaiswal", "Riyan Parag", "Shimron Hetmyer", "Dhruv Jurel",
        "Jofra Archer", "Ravindra Jadeja", "Sam Curran", "Donovan Ferreira",
        "Sandeep Sharma", "Shubham Dubey", "Vaibhav Suryavanshi",
        "Lhuan-Dre Pretorius", "Yudhvir Singh Charak", "Tushar Deshpande",
        "Kwena Maphaka", "Nandre Burger", "Ravi Bishnoi", "Sushant Mishra",
        "Yash Raj Punja", "Vignesh Puthur", "Ravi Singh", "Aman Rao",
        "Brijesh Sharma", "Adam Milne", "Kuldeep Sen"
    ]
};

export default iplSquads;
