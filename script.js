let currentQuestion = 0;
const questions = document.querySelectorAll(".question");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const output = document.getElementById("output");
const progressContainer = document.getElementById("progressContainer");

function updateProgress() {
  progressContainer.innerHTML = "";
  const total = questions.length;
  let completed = 0;

  const required = ["personality", "colors", "setting", "music"];
  completed += required.filter(name => document.querySelectorAll(`input[name='${name}']:checked`).length > 0).length;

  const creative = document.querySelector("textarea[name='creative']");
  if (creative && creative.value.trim().length > 0) completed++;

  progressContainer.innerHTML = `Progress: ${completed} / ${total} questions answered`;

  questions.forEach((q, idx) => {
    const status = document.createElement("div");
    status.textContent = `Q${idx + 1}: `;

    if (idx === total - 1) {
      status.textContent += creative && creative.value.trim() ? "✅" : "⭕";
    } else {
      const name = q.querySelector("input")?.name;
      const checked = document.querySelectorAll(`input[name='${name}']:checked`).length > 0;
      status.textContent += checked ? "✅" : "⭕";
    }

    progressContainer.appendChild(status);
  });
}

function changeQuestion(step) {
  questions[currentQuestion].classList.remove("active");
  currentQuestion += step;

  if (currentQuestion >= questions.length) {
    if (checkCompletion()) {
      submitQuiz();
    } else {
      alert("Please answer all questions before seeing your result.");
      currentQuestion--;
    }
  }

  if (currentQuestion < questions.length) {
    questions[currentQuestion].classList.add("active");
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.textContent = currentQuestion === questions.length - 1 ? "Submit" : "Next";
  }

  updateProgress();
}

function checkCompletion() {
  const required = ["personality", "colors", "setting", "music"];
  const creative = document.querySelector("textarea[name='creative']");
  return required.every(name => document.querySelectorAll(`input[name='${name}']:checked`).length > 0)
    && creative && creative.value.trim().length > 0;
}

function submitQuiz() {
  const answers = [];
  const form = document.getElementById("quizForm");
  const formData = new FormData(form);

  const values = {};
  for (let [name, value] of formData.entries()) {
    if (!values[name]) values[name] = [];
    values[name].push(value);
  }

  for (const key in values) {
    answers.push(...values[key]);
  }

  const finalPrompt = `Based on the following personality quiz traits: ${answers.join(", ")}, what genre of art would this person be best at and why? Respond in this format: 'Genre: [name] - [one-line description]'`;

  output.textContent = "Thinking... 🎨";
  nextBtn.disabled = true;

  fetch("https://art-genre-ai.onrender.com/genre", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: finalPrompt })
  })
  .then(res => res.json())
  .then(data => {
    const genre = data.genre || "Oops! Something went wrong.";
    output.innerHTML = `<p>${genre}</p>`;

    const shareText = `🎨 My art genre result: ${genre}\nFind yours at: https://personaland.com`;
    const shareContainer = document.createElement("div");
    shareContainer.style.display = "flex";
    shareContainer.style.gap = "12px";
    shareContainer.style.marginTop = "20px";
    shareContainer.style.alignItems = "center";

    const platforms = [
      {
        name: "Twitter",
        img: "images/twitter.png",
        action: () => {
          const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
          window.open(tweet, '_blank');
        }
      },
      {
        name: "Facebook",
        img: "images/facebook.png",
        action: () => {
          const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://personaland.com')}&quote=${encodeURIComponent(shareText)}`;
          window.open(fb, '_blank');
        }
      },
      {
        name: "Instagram",
        img: "images/instagram.png",
        action: () => {
          navigator.clipboard.writeText(shareText).then(() => {
            alert("Copied your result! Paste it into your Instagram story or post.");
          });
        }
      }
    ];

    platforms.forEach(p => {
      const btn = document.createElement("button");
      btn.className = "share-circle";
      btn.title = `Share on ${p.name}`;
      btn.onclick = p.action;

      const icon = document.createElement("img");
      icon.src = p.img;
      icon.alt = p.name;
      icon.style.width = "24px";
      icon.style.height = "24px";

      btn.appendChild(icon);
      shareContainer.appendChild(btn);
    });

    output.appendChild(shareContainer);
  })
  .catch(err => {
    output.textContent = "Something went wrong!";
    console.error(err);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateProgress();
  document.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", updateProgress);
  });
});