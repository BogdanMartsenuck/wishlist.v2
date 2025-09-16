async function loadGifts() {
    const res = await fetch("/api/gifts");
    const gifts = await res.json();
    const list = document.getElementById("gift-list");
    list.innerHTML = "";
  
    gifts.forEach(gift => {
      const card = document.createElement("div");
      card.className = "card";
  
      if (gift.image_url) {
        const img = document.createElement("img");
        img.src = gift.image_url;
        img.alt = gift.name;
        card.appendChild(img);
      }
  
      const body = document.createElement("div");
      body.className = "card-body";
  
      // Title
      const title = document.createElement("h3");
      title.textContent = gift.name;
      body.appendChild(title);
  
      // Description (NEW)
      if (gift.description) {
        const desc = document.createElement("p");
        desc.textContent = gift.description;
        body.appendChild(desc);
      }
  
      // Links
      if (gift.links) {
        const linksDiv = document.createElement("div");
        linksDiv.className = "links";
        JSON.parse(gift.links || "[]").forEach((url, i) => {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.textContent = `Вариант №${i + 1}`;
          linksDiv.appendChild(a);
        });
        body.appendChild(linksDiv);
      }
  
      // Actions (checkbox)
      const actions = document.createElement("div");
      actions.className = "actions";
  
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" ${gift.is_taken ? "checked" : ""}>
        ${gift.is_taken ? "Уже выбрали 🎉" : "Я куплю это"}
      `;
  
      //if (!gift.is_taken) {
        label.querySelector("input").addEventListener("change", async () => {
          await fetch(`/api/gifts/${gift.id}/toggle`, { method: "POST" });
          loadGifts();
        });
     // }
  
      actions.appendChild(label);
      body.appendChild(actions);
      card.appendChild(body);
      list.appendChild(card);
    });
  }
  
  // Initial load
  loadGifts();