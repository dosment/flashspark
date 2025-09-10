
export const encouragement = {
    excellent: [
        "You're a superstar! ✨",
        "Perfect score! You're on fire! 🔥",
        "Wow! You absolutely nailed it!",
        "Incredible work! Are you a wizard? 🧙‍♂️",
        "You didn't just pass, you soared! 🚀",
        "That was amazing! You're a true champion.",
        "Aced it! You're basically a genius.",
        "You've got the magic touch! ✨",
        "Is there anything you can't do? Outstanding!",
        "This is the way. You have spoken.",
        "You're the GOAT! 🐐",
        "Flawless victory!",
        "You understood the assignment. A+!",
        "Your brain is officially huge. 🧠",
        "To infinity... and beyond! Great job!",
    ],
    good: [
        "Great job! You're really getting the hang of this.",
        "Solid work! Keep up the great effort.",
        "Nice! A little more practice and you'll be unstoppable.",
        "You're doing great! Every quiz makes you stronger.",
        "Awesome effort! You're on the right track.",
        "Very well done! Keep that momentum going.",
        "I can see you've been practicing. It shows!",
        "You're climbing that mountain! Keep going!",
        "The force is strong with this one.",
        "That's what I'm talking about! Nice one.",
        "You're assembling knowledge like an Avenger!",
    ],
    keepTrying: [
        "Don't give up! Every mistake is a step forward.",
        "You've got this! Let's try it again.",
        "Practice makes perfect. You're on your way!",
        "Learning is a journey. Keep taking steps!",
        "Even superheroes have to train. You can do it!",
        "Failure is not the opposite of success, it's part of it.",
        "Do or do not. There is no try... so let's DO it again!",
        "I believe in you! Let's give it another go.",
        "Your comeback is going to be epic.",
        "Every master was once a beginner. Keep learning!",
    ],
};

export const getEncouragement = (score: number, total: number): string => {
    if (total === 0) return "Let's get started!";
    const percentage = (score / total);

    let category: 'excellent' | 'good' | 'keepTrying';

    if (percentage >= 0.9) {
        category = 'excellent';
    } else if (percentage >= 0.6) {
        category = 'good';
    } else {
        category = 'keepTrying';
    }

    const messages = encouragement[category];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}
