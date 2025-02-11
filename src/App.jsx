import { useState, useCallback, useEffect, memo, lazy, Suspense } from "react";
import DOMPurify from "dompurify";
import { FaSmile, FaTimes } from "react-icons/fa";
const Picker = lazy(() => import("@emoji-mart/react"));
import emojiData from "@emoji-mart/data";

// eslint-disable-next-line react/prop-types
const EmojiPicker = memo(({ onSelect }) => (
  <div className="mt-5">
    <Suspense fallback={<p className="has-text-dark">Loading...</p>}>
    <Picker
        data={emojiData}
        onEmojiSelect={(emoji) => onSelect(emoji.native)}
        theme="auto"
        categories={[
          "frequent",
          "people",
          "activity",
          //"flags",
          "foods",
          "nature",
          "objects",
          "places",
          "symbols",
        ]}
      />
    </Suspense>
  </div>
));
EmojiPicker.displayName = "EmojiPicker";

const App = () => {
  const [text, setText] = useState(() => localStorage.getItem("emojiText") || "");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem("emojiText", text);
  }, [text]);

  const handleEmojiSelect = useCallback((emoji) => {
    setText((prev) => prev + emoji);
  }, []);

  const handleChange = useCallback((e) => {
    const cleanText = DOMPurify.sanitize(e.target.value);
    if (cleanText.length <= 100) {
      setText(cleanText);
    }
  }, []);

  return (
    <section className="section mt-6">
      <div className="container">
      <div className="columns is-centered">
      <div className="column is-three-fifths">
        <div className="card p-5">
          <h2 className="title has-text-weight-semibold is-5 has-text-dark">Emoji Picker 😍</h2>
          <textarea className="textarea is-info" placeholder="📝" value={text} rows="5" onChange={handleChange} spellCheck={false} autoComplete="off" data-gramm_editor="false"  data-enable-grammarly="false" />
          <div className="mt-3 is-flex is-align-items-center">
            <button className="button is-warning" onClick={() => setShowPicker((s) => !s)}>
              {showPicker ? <FaTimes /> : <FaSmile />}
            </button>
          </div>
          {showPicker && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowPicker(false)} />}
        </div>
      </div>
      </div>
      </div>
    </section>
  );
};

export default App;
