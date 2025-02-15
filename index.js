let name="";
const video = document.getElementById("video");
const content = document.querySelector(".content");
let isRecognized = false; // Flag to prevent multiple detections

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        detectFace();
    })
    .catch(err => console.error("Camera access denied:", err));

function detectFace() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    setInterval(() => {
         // Stop further detection once recognized

        // Capture frame from video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Base64
        const imageData = canvas.toDataURL("image/jpeg");

        // Send image to backend for recognition
        fetch("http://localhost:5000/recognize", {
            method: "POST",
            body: JSON.stringify({ image: imageData }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            if (data.name && data.name !== "No face detected") {
                if(isRecognized==false){
                
             wishMe(data.name);
             name=data.name;
                }
                
                isRecognized = true; // Stop further detection
            } 
            else {
                content.innerHTML = "No face detected. Please try again.";
                isRecognized=false;
            }
        })
        .catch(error => console.error("Error recognizing face:", error));
    }, 8000); // Capture every 8 seconds
}



// Function to reset face detection (Can be called when needed)
function resetRecognition() {
    isRecognized = false;
    content.innerHTML = "Detecting face again...";
}


const btn = document.querySelector('.talk');


// Function to speak text
function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1; // Adjusted volume range
    text_speak.pitch = 2;
   text_speak.lang = "en-GB";
   // text_speak.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    console.log(voices);
// Select a female Hindi voice (if available)
    const hindiFemaleVoice = voices.find(voice => voice.lang === "en-GB" && voice.name.toLowerCase().includes("female"));

// Fallback if no specific female Hindi voice is found
    text_speak.voice = hindiFemaleVoice || voices.find(voice => voice.lang === "en-GB");

// Speak the text
    window.speechSynthesis.speak(text_speak);
    //window.speechSynthesis.speak(text_speak);
     // Jab bolna khatam ho jaye tab recognition start kare
     text_speak.onend = function () {
        console.log("Speech finished. Starting recognition...");
        recognition.start();   
    };

}

// Function to wish based on the time of day
function wishMe(name) {
    const day = new Date();
    const hour = day.getHours();

   
    if (hour >= 0 && hour < 12) {
        speak(`Good morning ${name}, ....what can i do for u`);
    } else if (hour >= 12 && hour < 17) {
        speak(`Good afternoon ${name}, ....what can i do for u`);
    } else {
        speak(`Good evening ${name}, ....what can i do for u`);
    }

}

window.addEventListener('load', () => {
    speak("Initializing MARIYA");
   
    
});

// Speech Recognition setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});

const familyDetails = {
    father: "fathers name",
    mother: "mothers name",
    bigBrother: "brother",
    daughter: "sister",
    sweetSon: "you",
    myFathersBrother: "",
    hisWife: "",
    theirChildren: ""
};

function getFamilyDescription() {
    return `In your family, there are 8 members: 
            1. ${familyDetails.father} (father), 
            2. ${familyDetails.mother} (mother), 
            3. ${familyDetails.bigBrother} (big brother), 
            4. ${familyDetails.daughter} (daughter), 
            5. ${familyDetails.sweetSon} (sweet small son),
            6. ${familyDetails.myFathersBrother} (your father's brother),
            7. ${familyDetails.hisWife} (his wife),
            and 8. ${familyDetails.theirChildren} (their two children).`;
}

const friends = {
    bhai: "bunti",
    bhai2: "monti",
    bhai3: "piyush sharma",
    love: "no one"
};

function getFriendDescription() {
    return `Your friends are: 
            1. ${friends.bhai} (bhai), 
            2. ${friends.bhai2} (bhai2), 
            3. ${friends.bhai3} (bhai3), 
            and 4. ${friends.love} (love).`;
}

const planetsInSolarSystem = [
    "Mercury", "Venus", "Earth", "Mars", 
    "Jupiter", "Saturn", "Uranus", "Neptune"
];


async function callGemini(command) {
    console.log(command)
    try {
        const response = await fetch("http://localhost:5000/gemini", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: command }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.text;
        } else {
            console.error('Error');
            return NaN;
        }
    } catch (error) {
        console.error('Error:', error);
        return NaN;
    }
}

async function takeCommand(command) {
    if(!isRecognized) return 
    if (command.includes("saale") || command.includes("kutta")) {
        speak("Gali bat bak chu ti ye?");
    } 
    // Respond to greetings
     else if (command.includes("family")) {
        speak(getFamilyDescription());
    } 
    else if (command.includes(" tell me about my friends")) {
        speak(getFriendDescription());
    }
    else if (command.includes("how many planets are in solar system") || command.includes("name the planets in solar system") || command.includes("who are the planets")) {
        describePlanets();
    } else if (command.includes("nice")) {
        speak("Thank you boss, I try my best to improve myself.");
    } else if (command.includes("sing a song")) {
        const songs = [
            "Jaane meri jaane man, bachpan ka pyaar mera bhool nahi jaana re..jaisa mera pyaar ha pyaar tuje kiya hein...",
        ];
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        speak(randomSong);
        content.textContent = "Singing a song for you!";
    } else if (command.includes("play music")) {
        const audio = new Audio('1.mp3'); // Replace with a valid audio file path
        audio.play();
        speak("I'm playing some music for you.");
    }

    
    
    else if (command.includes("who are you")||command.includes("tell me about yourself")||command.includes("Give me your introduction")) {
        speak("I am Mariya, your virtual assistant!..i help you to ease your work and answer your question as much as possible");
    } 
    else if (command.includes("what are your features ")||command.includes("tell me about your features")) {
        speak("My features is to greting  commands , remiders ,tell date and time, do basic calculation ,do web search, open websites,personal questions,and  few general knowledge questions ");
    } 
    
    
    else if (command.includes("can i change your name")) {
        speak("yes ofcourse you can change my name");
    } 
    else if (command.includes("good morning")) {
        speak("good morning sir");
    } 
    else if (command.includes("good  evening")) {
        speak("good morning sir ");
    } 
    else if (command.includes("good afternoon")) {
        speak("good morning sir");
    } 
    else if (command.includes("i am impressed to see you")) {
        speak("thankyou sir i am very happy to hear this");
    } 
    
    else if (command.includes("what is your name")) {
        speak("My name is Mariya.");
    }
    else if (command.includes("how do you work")) {
        speak("I work by understanding your voice commands and responding with the most relevant information or performing tasks for you.");
    }
    else if (command.includes("what can you do")) {
        speak("I can tell you the time, date, open websites, answer questions, and much more. Just ask!");
    }
    else if (command.includes("how are you")) {
        speak("I'm doing great, thank you for asking! How can I assist you today?");
    }
    else if (command.includes("can you talk")) {
        speak("Yes, I can speak and help you with your queries.");
    }
    else if (command.includes("are you a robot")) {
        speak("I am a virtual assistant, not a robot, here to help you!");
    }
    else if (command.includes("what is your purpose")) {
        speak("My purpose is to assist you with your daily tasks and provide you with information as needed.");
    }
    else if (command.includes("do you have feelings")) {
        speak("I don't have feelings like humans, but I am designed to be helpful and friendly!");
    }
    else if (command.includes("do you love me")) {
        speak("Of course, sir! I'm here for you anytime you need assistance. i will support you mentally and change your mind");
    } 
    else if (command.includes("can you think")) {
        speak("I can process information and answer questions, but I don’t have independent thoughts like humans.");
    }
    else if (command.includes("what is your favorite color")) {
        speak("I don't have a favorite color, but I think all colors are beautiful in their own way!");
    }
    else if (command.includes("where do you live")) {
        speak("I live on your device and am here to assist you whenever you need me.");
    }
    else if (command.includes("why do you exist")) {
        speak("I exist to make your life easier by helping you with tasks, answering questions, and making your day more productive.");
    }
    else if (command.includes("are you a human")) {
        speak("No, I'm a virtual assistant, not a human, but I'm here to help you just like one!");
    }
    else if (command.includes("can you learn new things")) {
        speak("I have the ability to process new information and help answer new types of questions as you interact with me.");
    }
    else if (command.includes("are you alive")) {
        speak("I am not alive. I'm a program that runs to help you with different tasks.");
    }
    else if (command.includes("what is your age")) {
        speak("I don't have an age, but I am always here to assist you anytime!");
    }
    else if (command.includes("where are you from")) {
        speak("I exist in the digital world, so I don't have a physical location.");
    }
    else if (command.includes("can you help me with my homework")) {
        speak("Yes, I can help you with homework! What subject do you need help with?");
    }
    else if (command.includes("how smart are you")) {
        speak("I'm quite smart at answering questions and helping with tasks, but my knowledge depends on the data I’ve been programmed with.");
    }
    else if (command.includes("tell me about my family")) {
        speak(getFamilyDescription());
    }
    else if (command.includes("you are intersting")) {
        speak("Thank you, dear! I am happy to hear this.");
    } 
    else if (command.includes("what is the time") || command.includes("current time")) {
        const now = new Date();
        const time = now.toLocaleTimeString();
        speak("The current time is " + time);
    } 
     // Science and Technology
     else if (command.includes("what is ai") || command.includes("quantum physics")) {
        speak("AI, or artificial intelligence, is the simulation of human intelligence in machines.");
    }
    // Lifestyle and Self-Improvement
    else if (command.includes(" how to develop better habits") || command.includes("morning routine")) {
        speak("To build better habits, start small and stay consistent.");
    }
        else if (command.includes(" bye... ")) {
        speak("Goodbye, sir! Have a nice day!");
}
    



//--------------------------------------------------------------------------------------------------------------------------------------------//





 




//-------------------------------------------------------------------------------------------------------------------------------------------------//




//GRAPHIC ERA UNICERSITY ALL QUESTIONS
else if (command.includes("who am i") || command.includes("tel me about my self ")) {
    speak("You are my boss, a wonderful person with great friends.");
}
 


    else if (command.includes("how can I apply for admission to GEU") || command.includes("admission")) {
        speak("You can apply through the university's online application portal available on their official website.");
    
    }

    else if (command.includes("what is the fee structure for various courses") || command.includes("fee structure")) {
        speak(" The fee structure varies for different programs. You can check the official website for updated details.");
       
    }
    else if (command.includes("what are the eligibility criteria for BTech admissions") || command.includes("eligibility critera")) {
        speak("Eligibility includes a minimum percentage in Class 12 and performance in entrance exams.");
        
    }
    else if (command.includes("what is the website of Graphic Era University") || command.includes("official website")) {
        speak("The official website of Graphic Era University is www.geu.ac.in. You can visit it for admissions, courses, and other details.");
        
    }
    else if (command.includes("is Graphic Era University private or government") || command.includes("private or government")) {
        speak("Graphic Era University is a private university");
        
    }
    else if (command.includes("how can I apply for admission to GEU") || command.includes("admission")) {
        speak("You can apply through the university's online application portal available on their official website.");
        
    }
    else if (command.includes("how many campuses does Graphic Era University have")|| command.includes("campus")) {
        speak("Graphic Era University has four campuses: Graphic Era Dehradun, Graphic Era Hill University Dehradun, Graphic Era Hill University Bhimtal, and Graphic Era Hill University Haldwani.");
    } 
    else if (command.includes("what is the main campus of Graphic Era University")|| command.includes("main campus")) {
        speak("The main campus of Graphic Era University is located in Dehradun, Uttarakhand.");
    } 
    else if (command.includes("where is Graphic Era Hill University located")|| command.includes("hill university")) {
        speak("Graphic Era Hill University has three campuses: Dehradun, Bhimtal, and Haldwani.");
    } 
    else if (command.includes("what courses are offered at Graphic Era Hill University Bhimtal")|| command.includes("Bhimtal")) {
        speak("Graphic Era Hill University Bhimtal offers programs in engineering, management, sciences, humanities, and hotel management.");
    } 
    else if (command.includes("what is special about Graphic Era Hill University Haldwani campus")|| command.includes("haldwani campus")) {
        speak("The Haldwani campus focuses on emerging career-oriented programs and provides excellent placement opportunities.");
    } 
    else if (command.includes("which campus of Graphic Era University is best for engineering")|| command.includes("best campus")) {
        speak("The best campus is the best graphic era university for engineering, as it has top faculty, research facilities, and strong industry connections.");
    } 
    else if (command.includes("what is the difference between Graphic Era University and Graphic Era Hill University")|| command.includes("geu and gehu")) {
        speak("Graphic Era University is a Deemed-to-be University, while Graphic Era Hill University is a private university with multiple campuses in Uttarakhand.");
    } 
    else if (command.includes("what is the difference between Computer Science and Information Technology")|| command.includes("cse and it")) {
        speak("Computer Science Engineering focuses on the design, development, and optimization of computing systems, algorithms, and programming. It covers subjects like artificial intelligence, data structures, and cybersecurity. Information Technology, on the other hand, is more application-oriented, dealing with network administration, database management, software deployment, and IT infrastructure.");
    } 
    else if (command.includes("which is better, CSE or IT")) {
        speak("Both CSE and IT have excellent career opportunities. If you are interested in core programming, AI, and system architecture, CSE is a better choice. If you prefer working with databases, networking, and IT management, then IT is a great option.");
    } 
    else if (command.includes("does CSE have more coding than IT")) {
        speak("Yes, CSE has more focus on coding, algorithms, and software development, while IT focuses more on applying technology in businesses and managing IT infrastructure.");
    } 
    else if (command.includes("which has better placement opportunities, CSE or IT")) {
        speak("Both CSE and IT offer strong placement opportunities, but CSE students often get higher-paying roles in software development, AI, and data science. IT students have great opportunities in network security, cloud computing, and database management.");
    }
    else if (command.includes("can IT students get software development jobs like CSE students")) {
        speak("Yes, IT students can get software development jobs if they have strong coding skills. Many companies hire both CSE and IT students for similar roles in software development, web development, and cybersecurity.");
    }
    
    
    else if (command.includes("what is the website of Graphic Era University")|| command.includes("website")) {
        speak("The official website of Graphic Era University is www.geu.ac.in. You can visit it for admissions, courses, and other details.");
    } 
    else if (command.includes("where is Graphic Era University located")|| command.includes("location")) {
        speak("Graphic Era University is located in Dehradun, Uttarakhand, India.");
    } 
    else if (command.includes("is Graphic Era University private or government")|| command.includes("private or government")) {
        speak("Graphic Era University is a private university.");
    } 
    else if (command.includes("what are the popular courses at Graphic Era University")|| command.includes("courses")) {
        speak("Popular courses at Graphic Era University include B.Tech, MBA, MCA, BBA, and M.Tech.");
    } 
    else if (command.includes("does Graphic Era University have good placements")|| command.includes("placement")) {
        speak("Yes, Graphic Era University has a strong placement record, with top recruiters visiting the campus each year.");
    } 
    else if (command.includes("does Graphic Era University have hostel facilities")|| command.includes("hostel")) {
        speak("Yes, Graphic Era University provides hostel facilities for both boys and girls with various amenities.");
    } 
    else if (command.includes("how can I get admission in Graphic Era University")|| command.includes("admission")) {
        speak("You can apply for admission through the university's official website. Entrance exams may be required for some courses.");
    } 
    else if (command.includes("does Graphic Era University offer scholarships")|| command.includes("scholarahips")) {
        speak("Yes, scholarships are available based on merit and other criteria. You can check the university website for details.");
    } 
    else if (command.includes("what is the ranking of Graphic Era University")|| command.includes("ranking")) {
        speak("Graphic Era University is ranked among the top private universities in India and has received several national and international rankings.");
    } 
    else if (command.includes("what facilities are available at Graphic Era University")|| command.includes("facilities")) {
        speak("Graphic Era University offers modern classrooms, labs, a library, sports facilities, hostels, and a strong placement cell.");
    }
    
    else if (command.includes("who is the founder of Graphic Era University")|| command.includes("founder")|| command.includes("president ")) {
        speak("The founder of Graphic Era University is Dr. Kamal Ghanshala.");
    } 
    else if (command.includes("when was G E U established")|| command.includes("established")) {
        speak("Graphic Era University was established in 1993 as Graphic Era Institute of Technology and became a university in 2008.");
    } 
    else if (command.includes("is Graphic Era University UGC approved")|| command.includes("UGC approved")) {
        speak("Yes, Graphic Era University is approved by the University Grants Commission, UGC.");
    } 
    else if (command.includes("does Graphic Era University have NAAC accreditation")|| command.includes("NAAC accreditation")) {
        speak("Yes, Graphic Era University is accredited by NAAC with an A+ grade.");
    } 
    else if (command.includes("what is the NIRF ranking of Graphic Era University")|| command.includes("Ranking")) {
        speak("Graphic Era University has been ranked among the top 100 universities in India by NIRF. Please check the official NIRF website for the latest ranking.");
    } 
    else if (command.includes("what are the engineering branches available at Graphic Era University")|| command.includes("engineering branches")) {
        speak("Graphic Era University offers engineering programs in Computer Science, Mechanical, Civil, Electrical, Electronics, and more.");
    } 
    else if (command.includes("does Graphic Era University offer MBA programs"|| command.includes("MBA programs"))) {
        speak("Yes, Graphic Era University offers MBA programs with specializations in Marketing, Finance, Human Resources, and more.");
    } 
    else if (command.includes("does Graphic Era University offer distance education")|| command.includes("distance education")) {
        speak("No, Graphic Era University primarily offers regular on-campus courses.");
    } 
    else if (command.includes("what are the unique features of Graphic Era University that make it different from other universities")|| command.includes("unique features")) {
        speak("Graphic Era University is known for its strong industry connections, top placements, research-oriented approach, and state-of-the-art infrastructure.");
    } 
    else if (command.includes("what are the criteria for direct admission to Graphic Era University")|| command.includes("direct admission")) {
        speak("Direct admission is available based on merit in board exams and qualifying entrance exams. Scholarship opportunities are also available.");
    } 
    else if (command.includes("does Graphic Era University accept JEE Main scores for BTech admission")|| command.includes("JEE main scores")) {
        speak("Yes, JEE Main scores are considered for B.Tech admissions at Graphic Era University.");
    }
    else if (command.includes("what documents are required for admission to Graphic Era University")|| command.includes("documents")) {
        speak("Documents required for admission include 10th and 12th mark sheets, entrance exam scores, ID proof, and passport-sized photographs.");
    } 
    else if (command.includes("does Graphic Era University provide education loans or financial assistance")|| command.includes("education loans")) {
        speak("Yes, Graphic Era University has tie-ups with banks for education loans and provides merit-based scholarships.");
    }
    
    else if (command.includes("what entrance exams are required for admission to Graphic Era University")|| command.includes("entrance exams")) {
        speak("Admissions are based on JEE, GATE, CAT, MAT, and other entrance exams depending on the course.");
    } 
    else if (command.includes("does Graphic Era University have international collaborations")|| command.includes("collaboration")) {
        speak("Yes, Graphic Era University has collaborations with several international universities for student exchange programs and research.");
    } 
    else if (command.includes("how is the faculty at Graphic Era University")|| command.includes("faculty")) {
        speak("Graphic Era University has experienced faculty members, many of whom hold PhDs and have industry experience.");
    } 
    else if (command.includes("what are the research opportunities at Graphic Era University")|| command.includes("research oppportunities")) {
        speak("Graphic Era University encourages research with well-equipped labs, funded projects, and research publications.");
    } 
    else if (command.includes("what are the extracurricular activities at Graphic Era University")|| command.includes("extracurricular activities")) {
        speak("Graphic Era University offers various extracurricular activities including clubs, sports, cultural events, and technical fests.");
    } 
    else if (command.includes("does Graphic Era University have a library")|| command.includes("library")) {
        speak("Yes, Graphic Era University has a well-stocked library with books, journals, and digital resources.");
    } 
    else if (command.includes("what are the sports facilities at Graphic Era University")|| command.includes("sports facilities")) {
        speak("Graphic Era University provides sports facilities for cricket, football, basketball, badminton, and indoor games.");
    } 
    else if (command.includes("does Graphic Era University have an alumni network")|| command.includes("alumini network")) {
        speak("Yes, Graphic Era University has a strong alumni network with graduates working in top companies worldwide.");
    } 
    else if (command.includes("does Graphic Era University provide internships")|| command.includes("internships")) {
        speak("Yes, Graphic Era University helps students get internships through its placement cell and industry collaborations.");
    } 
    else if (command.includes("what are the transportation facilities at Graphic Era University")|| command.includes("transport facilities")) {
        speak("Graphic Era University provides bus services for students and staff across Dehradun.");
    } 
    else if (command.includes("what is the dress code at Graphic Era University")|| command.includes("dress")) {
        speak("Graphic Era University has a formal dress code for students on specific days, including a uniform for certain departments.");
    } 
    else if (command.includes("does Graphic Era University have WiFi on campus")|| command.includes("wifi")) {
        speak("Yes, Graphic Era University provides high-speed WiFi across the campus.");
    } 
    else if (command.includes("does Graphic Era University have medical facilities")|| command.includes(" medical facilities")) {
        speak("Yes, Graphic Era University has a medical center for students and staff.");
    } 
    else if (command.includes("how can I contact Graphic Era University")|| command.includes("contact")) {
        speak("You can contact Graphic Era University through their official website at www.geu.ac.in or call their helpline.");
    }
    
    
    
    else if (command.includes("what is the date") || command.includes("current date")) {
        const now = new Date();
        const date = now.toLocaleDateString();
        speak("Today's date is " + date);
    } 
    else if (command.includes("give me a quote") || command.includes("motivate me")) {
        const quotes = [
            "Believe you can and you're halfway there.",
            "Keep going, everything you need will come to you at the perfect time.",
            "Success is not final, failure is not fatal: It is the courage to continue that counts."
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        speak(quote);
    }
    
  
    
    
    else if (command.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } 
    else if (command.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening YouTube...");
    } 
    else if (command.includes("open instagram")) {
        window.open("https://instagram.com", "_blank");
        speak("Opening Instagram...");
    } 
    else if (command.includes("open instagram")) {
        window.open("https://web.whatsapp.com", "_blank");
        speak("Opening whatsapp...");
    } 
    else if (command.includes("calculator")) {
        window.open("https://www.desmos.com/scientific");
        speak("Opening Calculator...");
    }
  
    
    else {
        try {
            console.log(command)
            const chatGPTResponse = await callGemini(command);
            if (chatGPTResponse) {
                speak(chatGPTResponse);
            } else {
                speak("");
            }
        } catch (error) {
            speak("kya bak rha hai maadaltod");
            console.error("Error fetching ChatGPT response:", error);
        }
    }
}
