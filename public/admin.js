async function loadGifts() {
    const res = await fetch("/api/gifts");
    const gifts = await res.json();
    const list = document.getElementById("gift-list");
    list.innerHTML = "";
  
    gifts.forEach(gift => {
      const card = document.createElement("div");
      card.className = "card";
  
      const body = document.createElement("div");
      body.className = "card-body";
  
      const title = document.createElement("h3");
      title.textContent = gift.name;
      body.appendChild(title);
  
      // Show description if exists
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
          a.textContent = `Ссылка ${i + 1}`;
          linksDiv.appendChild(a);
        });
        body.appendChild(linksDiv);
      }
  
      // Delete button
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Удалить ❌";
      btnDelete.addEventListener("click", async () => {
        await fetch(`/api/gifts/${gift.id}`, { method: "DELETE" });
        loadGifts();
      });
      body.appendChild(btnDelete);
  
      // Edit description
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Редактировать описание ✏️";
      btnEdit.addEventListener("click", async () => {
        const newDesc = prompt("Введите новое описание:", gift.description || "");
        if (newDesc !== null) {
          await fetch(`/api/gifts/${gift.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...gift, description: newDesc })
          });
          loadGifts();
        }
      });
      body.appendChild(btnEdit);
  
      // Edit description
      const btnEditImage = document.createElement("button");
      btnEditImage.textContent = "Редактировать картинку ✏️";
      btnEditImage.addEventListener("click", async () => {
        const newImageUrl = prompt("Введите новую ссылку:", gift.image_url || "");
        if (newImageUrl !== null) {
          await fetch(`/api/gifts/image/${gift.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...gift, image_url: newImageUrl })
          });
          loadGifts();
        }
      });
      body.appendChild(btnEditImage);
  
      card.appendChild(body);
      list.appendChild(card);
    });
  }
  
  // Add new gift
  document.getElementById("add-form").addEventListener("submit", async e => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const image_url = document.getElementById("image_url").value;
    const links = document.getElementById("links").value
      ? document.getElementById("links").value.split(",").map(s => s.trim())
      : [];
    const description = document.getElementById("description").value;
  
    await fetch("/api/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, image_url, links, description })
    });
  
    document.getElementById("add-form").reset();
    loadGifts();
  });
  
  // Initial load
  loadGifts();