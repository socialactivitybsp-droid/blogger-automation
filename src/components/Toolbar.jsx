export default function Toolbar({ editor, view, setView }) {
  if (!editor) return null;

  return (
    <div className="toolbar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()}>P</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" onClick={() => {
        const url = window.prompt('Enter URL');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }}>Link</button>
      <div className="view-toggle">
        <button type="button" className={view === 'compose' ? 'active' : ''} onClick={() => setView('compose')}>Compose View</button>
        <button type="button" className={view === 'html' ? 'active' : ''} onClick={() => setView('html')}>HTML View</button>
      </div>
    </div>
  );
}
