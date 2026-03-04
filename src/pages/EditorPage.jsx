import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Editor from '@monaco-editor/react';
import Toolbar from '../components/Toolbar';
import SettingsPanel from '../components/SettingsPanel';
import { useStore } from '../store/useStore';

export default function EditorPage() {
  const navigate = useNavigate();
  const postData = useStore((state) => state.postData);
  const updatePostData = useStore((state) => state.updatePostData);
  const upsertCurrentPost = useStore((state) => state.upsertCurrentPost);
  const [view, setView] = useState('compose');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: postData.content_html,
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      updatePostData({ content_html: html });
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (postData.content_html !== editor.getHTML()) {
      editor.commands.setContent(postData.content_html || '<p></p>', false);
    }
  }, [postData.content_html, editor]);

  const activeStatus = useMemo(() => (view === 'compose' ? 'Compose View' : 'HTML View'), [view]);

  const onDraft = () => {
    upsertCurrentPost('draft');
    window.alert('Draft saved locally.');
  };

  const onPublish = () => {
    upsertCurrentPost('published');
    window.alert('Publish is dummy for now. Marked as published locally.');
  };

  return (
    <div className="page editor-page">
      <div className="editor-top">
        <button type="button" className="icon-btn" onClick={() => navigate('/generate')}>↩</button>
        <div className="row">
          <button type="button" className="btn secondary" onClick={onDraft}>Draft</button>
          <button type="button" className="btn" onClick={onPublish}>Publish</button>
          <button type="button" className="icon-btn" onClick={() => setSettingsOpen(true)}>⚙</button>
        </div>
      </div>

      <input
        className="title-input"
        placeholder="Title"
        value={postData.title}
        onChange={(event) => updatePostData({ title: event.target.value })}
      />

      <Toolbar editor={editor} view={view} setView={setView} />
      <p className="active-view">Active: {activeStatus}</p>

      <div className="editor-shell">
        {view === 'compose' ? (
          <EditorContent editor={editor} className="compose-editor" />
        ) : (
          <Editor
            height="100%"
            defaultLanguage="html"
            value={postData.content_html}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
            onChange={(value) => updatePostData({ content_html: value || '' })}
          />
        )}
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {settingsOpen ? <div className="backdrop" onClick={() => setSettingsOpen(false)} aria-hidden="true" /> : null}
    </div>
  );
}
