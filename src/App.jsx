import { useState } from "react";

export default function App() {

  const [mode, setMode] = useState("1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editorView, setEditorView] = useState("compose");
  const [editableHtml, setEditableHtml] = useState("");
  const MASTER_TEMPLATE = `
      <h1 style="background-color: red; color: white; font-weight: bold; margin: 0px; padding: 15px 0px; text-align: center;">
   <a href="https://socialactivitybspnews.blogspot.com/?m=1" style="color: white; text-decoration: none;" target="_blank">
   Social Activity BSP<br />
   </a>
</h1>
<div class="separator" style="clear: both; text-align: center;">
   <a href="{{HERO_IMAGE}}" style="margin-left: 1em; margin-right: 1em;">
   <img border="0" src="{{HERO_IMAGE}}" width="640" />
   </a>
</div>
{{CONTENT}}
<p><b><a href="https://socialactivitybspnews.blogspot.com/?m=1" style="color: black;" target="_blank">Social Activity BSP</a>👈</b></p>
<p><b>रिपोर्ट :- शेख सरफराज़ अहमद</b></p>
<br />
<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjsvvbXOswrNZCgzR6BBo91tpBsj6LKJNDk30fPvTJ-1tkk0Rvno88yEQIs3iyfZOlbrWuRXCT4jh8UMdg3htX_-0nWBUJrmQaF1XAePpm90W_m_0hPf27LLcmt6Xo7cBIr7jCB_Dehyyf0DXjn6vVakxuP5s9K6qNxB_ovdwgm7xLWtCp6mPgI2Jchafg/s1050/WhatsApp%20Image%202025-10-30%20at%2010.13.42%20PM%20(1).jpeg" style="margin-left: 1em; margin-right: 1em;"><img border="0" data-original-height="600" data-original-width="1050" height="366" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjsvvbXOswrNZCgzR6BBo91tpBsj6LKJNDk30fPvTJ-1tkk0Rvno88yEQIs3iyfZOlbrWuRXCT4jh8UMdg3htX_-0nWBUJrmQaF1XAePpm90W_m_0hPf27LLcmt6Xo7cBIr7jCB_Dehyyf0DXjn6vVakxuP5s9K6qNxB_ovdwgm7xLWtCp6mPgI2Jchafg/w640-h366/WhatsApp%20Image%202025-10-30%20at%2010.13.42%20PM%20(1).jpeg" width="640" /></a></div>
<br />
<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgClphlYaOLdnfyFMlGZz2KpXlIc9MDJw9R-Ly0lzoD94syceA0WXZ3qrHKGP4oVRhT-dBy8USp7zrxztsm6lH-UYN-7R0rl0mAgmbpI3jlplpt9bCSZr1zZ_Be1QvcV2kSDDj0gzdYlBaGPCf8I_jHRw6rODP8dD-3y7BpBGpLJsRrv4NugJeebXNoqXE/s1280/WhatsApp%20Image%202025-10-30%20at%2010.13.42%20PM.jpeg" style="margin-left: 1em; margin-right: 1em;"><img border="0" data-original-height="853" data-original-width="1280" height="426" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgClphlYaOLdnfyFMlGZz2KpXlIc9MDJw9R-Ly0lzoD94syceA0WXZ3qrHKGP4oVRhT-dBy8USp7zrxztsm6lH-UYN-7R0rl0mAgmbpI3jlplpt9bCSZr1zZ_Be1QvcV2kSDDj0gzdYlBaGPCf8I_jHRw6rODP8dD-3y7BpBGpLJsRrv4NugJeebXNoqXE/w640-h426/WhatsApp%20Image%202025-10-30%20at%2010.13.42%20PM.jpeg" width="640" /></a></div>
<p></p>
<p></p>
<div class="separator" style="clear: both; text-align: center;"><span style="margin-left: 1em; margin-right: 1em;"><a href="https://docs.google.com/forms/d/e/1FAIpQLSd6pKsoLJ09lAw1ixgZtNUTkp1P12jM-0Bx2WnRnQWSCEC0OQ/viewform?usp=publish-editor" target="_blank"><img border="0" data-original-height="3464" data-original-width="2598" height="640" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhX8a1eAtWW3A_X-yz2br0uxOSxgRDhUJQCVMxDpg6Hc0Y68jWr1pgN7TdiYIiLwbevptN8CkU1atyKyj6Ymlmlo0g9N4x_EEUDkt0q6Jwsr4Mvbj8SqGbpp6RzDhBGzpq1KB9-Hxuk-lee_CTgfSCkXH60EEoRw2wa5EF6f679zLBOzoOKNMagKPKUMPY/w480-h640/Picsart_25-10-26_20-03-09-271.jpg" width="480" /></a></span></div>
<b>
   <a href="https://docs.google.com/forms/d/e/1FAIpQLSd6pKsoLJ09lAw1ixgZtNUTkp1P12jM-0Bx2WnRnQWSCEC0OQ/viewform?usp=publish-editor" target="_blank">
      <br />
      <div style="text-align: center;"><b>Click here 👆👆</b></div>
   </a>
</b>
<p></p>
<div style="clear: both; text-align: center;">
   <div style="align-items: center; backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.2); border-radius: 25px; box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 15px; display: flex; flex-direction: column; justify-content: center; margin: 20px auto; padding: 20px; text-align: center; width: 90%;">
      <!--Profile Image-->
      <img alt="Sheikh Sarfaraz Ahamad" src="https://imgdentifys.netlify.app/sarfraz.png" style="border-radius: 50%; border: 4px solid black; height: 120px; margin-bottom: 10px; object-fit: cover; width: 120px;" />
      <!--Name-->
      <div style="margin: 5px 0px;">
         <a href="https://sarfarazahamad.blogspot.com/2025/10/social-activity-bsp-official-bio-page.html?m=1" style="color: black; font-size: 18px; font-weight: bold; text-decoration: none; text-shadow: rgba(0, 0, 0, 0.5) 1px 1px 3px;" target="_blank">
         शेख सरफराज़ अहमद
         </a>
      </div>
      <!--Channel-->
      <div style="margin: 5px 0px;">
         <a href="https://sarfarazahamad.blogspot.com/2025/10/social-activity-bsp-official-bio-page.html?m=1" style="color: black; font-size: 16px; text-decoration: none; text-shadow: rgba(0, 0, 0, 0.5) 1px 1px 3px;" target="_blank">
         Social Activity BSP
         </a>
      </div>
      <!--Role-->
      <div style="margin: 5px 0px;">
         <a href="https://sarfarazahamad.blogspot.com/2025/10/social-activity-bsp-official-bio-page.html?m=1" style="color: black; font-size: 15px; font-style: italic; text-decoration: none; text-shadow: rgba(0, 0, 0, 0.5) 1px 1px 3px;" target="_blank">
         (Media Chief)
         </a>
      </div>
   </div>
   <br />
   <p></p>
   <!--Font Awesome CDN-->
   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
   </link>
   <div style="backdrop-filter: blur(10px); background-color: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 25px 0px; text-align: center;">
      <h2 style="color: black; font-family: Arial, Helvetica, sans-serif; font-size: 22px; margin-bottom: 15px;">Join Us</h2>
      <div style="align-items: center; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
         <!--WhatsApp Channel-->
         <a href="https://whatsapp.com/channel/0029VaEdau3HbFV1YF0Ca50k" style="align-items: center; background-color: #25d366; border-radius: 50%; color: white; display: flex; font-size: 24px; height: 50px; justify-content: center; text-decoration: none; transition: 0.3s; width: 50px;" target="_blank">
         <i class="fab fa-whatsapp"></i>
         </a>
         <!--WhatsApp Group-->
         <a href="https://chat.whatsapp.com/Im3mG2HJjV7LqegyQWay3R?mode=ems_copy_t" style="align-items: center; background-color: #25d366; border-radius: 50%; color: white; display: flex; font-size: 24px; height: 50px; justify-content: center; text-decoration: none; transition: 0.3s; width: 50px;" target="_blank">
         <i class="fab fa-whatsapp"></i>
         </a>
         <!--Instagram-->
         <a href="https://www.instagram.com/socialactivitybsp?igsh=aDVubndqMXJ5c3Bm" style="align-items: center; background: radial-gradient(circle at 30% 107%, rgb(253, 244, 151) 0%, rgb(253, 244, 151) 5%, rgb(253, 89, 73) 45%, rgb(214, 36, 159) 60%, rgb(40, 90, 235) 90%); border-radius: 50%; color: white; display: flex; font-size: 24px; height: 50px; justify-content: center; text-decoration: none; transition: 0.3s; width: 50px;" target="_blank">
         <i class="fab fa-instagram"></i>
         </a>
         <!--X (Twitter)-->
         <a href="https://x.com/SocialActiv_BSP?t=9jzQcUIFX1RBb0NF2rGzPQ&amp;s=09" style="align-items: center; background-color: black; border-radius: 50%; color: white; display: flex; font-size: 24px; height: 50px; justify-content: center; text-decoration: none; transition: 0.3s; width: 50px;" target="_blank">
         <i class="fab fa-x-twitter"></i>
         </a>
         <!--YouTube-->
         <a href="https://youtube.com/@socialactivitybsp?si=sFWhijhXgQAzwvnC" style="align-items: center; background-color: red; border-radius: 50%; color: white; display: flex; font-size: 24px; height: 50px; justify-content: center; text-decoration: none; transition: 0.3s; width: 50px;" target="_blank">
         <i class="fab fa-youtube"></i>
         </a>
      </div>
   </div>
</div>
`;

  const generatePost = async () => {

  if (!description) return alert("Description required");

  setLoading(true);

  let prompt = `
  You are a Hindi local news generator for Bilaspur.
  Location default: Bilaspur.
  Avoid unsafe or graphic details.

  Return strictly JSON:
  {
    "title":"",
    "search_description":"",
    "slug":"",
    "labels":"",
    "html":""
  }
  `;

  if (mode === "1") {
    prompt += `
    Improve this title for SEO: ${title}
    Use this description: ${description}
    `;
  } else {
    prompt += `
    Generate SEO title from this:
    ${description}
    `;
  }

  try {

    // 🔥 YOU FORGOT THIS
    const response = await window.puter.ai.chat(prompt);

    const raw = response.message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(raw);

    // Clean newline issue properly
    const cleanedHtml = data.html
      .replace(/\\n/g, "")
      .replace(/\n/g, "");

    // Override html inside data
    data.html = cleanedHtml;

    setGenerated(data);
    setEditableHtml(cleanedHtml);

  } catch (err) {
    console.error(err);
    alert("AI Error");
  }

  setLoading(false);
};

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>AI Blogger Newsroom</h2>

      {/* Mode Toggle */}
      <div>
        <label>
          <input type="radio" value="1" checked={mode==="1"} onChange={()=>setMode("1")} />
          Title + Description
        </label>

        <label style={{marginLeft:20}}>
          <input type="radio" value="2" checked={mode==="2"} onChange={()=>setMode("2")} />
          Description Only
        </label>
      </div>

      {/* Inputs */}
      {mode === "1" && (
        <input
          placeholder="Enter Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width:"100%", marginTop:10 }}
        />
      )}

      <textarea
        placeholder="Enter Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ width:"100%", marginTop:10, height:120 }}
      />

      <button onClick={generatePost} disabled={loading} style={{marginTop:10}}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {/* Output */}
      {generated && (
  <div style={{ marginTop: 30 }}>

    <h3>Meta Data</h3>
    <p><b>Title:</b> {generated.title}</p>
    <p><b>Search Description:</b> {generated.search_description}</p>
    <p><b>Slug:</b> {generated.slug}</p>
    <p><b>Labels:</b> {generated.labels}</p>

    <hr />

    {/* View Toggle */}
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setEditorView("compose")}
        style={{
          marginRight: 10,
          background: editorView === "compose" ? "#222" : "#ccc",
          color: editorView === "compose" ? "#fff" : "#000"
        }}
      >
        Compose
      </button>

      <button
        onClick={() => setEditorView("html")}
        style={{
          background: editorView === "html" ? "#222" : "#ccc",
          color: editorView === "html" ? "#fff" : "#000"
        }}
      >
        HTML
      </button>
    </div>

    {/* Compose View */}
    {editorView === "compose" && (
      <div
        dangerouslySetInnerHTML={{ __html: editableHtml }}
        style={{
          border: "1px solid #ccc",
          padding: 15,
          minHeight: 200
        }}
      />
    )}

    {/* HTML View */}
    {editorView === "html" && (
      <textarea
        value={editableHtml}
        onChange={(e) => setEditableHtml(e.target.value)}
        style={{
          width: "100%",
          height: 300,
          fontFamily: "monospace",
          border: "1px solid #ccc",
          padding: 10
        }}
      />
    )}
  </div>
)}
    </div>
  );
}