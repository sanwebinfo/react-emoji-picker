import { useState, useCallback, useEffect, memo, lazy, Suspense, useDeferredValue, useTransition } from "react";
import DOMPurify from "dompurify";
import { FaSmile, FaTimes, FaClipboard, FaSearch } from "react-icons/fa";
import { init, SearchIndex } from "emoji-mart";
import emojiData from "@emoji-mart/data";
const Picker = lazy(() => import("@emoji-mart/react"));

init({ data: emojiData });

// eslint-disable-next-line react/prop-types
const EmojiPicker = memo(({ onSelect }) => (
  <div className="mt-3">
    <Suspense fallback={<p className="has-text-dark">Loading...</p>}>
      <Picker
        data={emojiData}
        onEmojiSelect={(emoji) => onSelect(emoji.native)}
        theme="auto"
        dynamicWidth={true}
        categories={["frequent", "people", "activity", "foods", "nature", "objects", "places", "symbols"]}
      />
    </Suspense>
  </div>
));
EmojiPicker.displayName = "EmojiPicker";

const App = () => {
  const [text, setText] = useState(() => localStorage.getItem("emojiText") || "");
  const [showPicker, setShowPicker] = useState(false);
  const [alert, setAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("emojiText", text);
    }, 500);
    return () => clearTimeout(timeout);
  }, [text]);

  useEffect(() => {
    if (!deferredSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    startTransition(async () => {
      try {
        const results = await SearchIndex.search(deferredSearchQuery);
        setSearchResults(results?.length ? results.map((e) => e.skins[0].native) : ["No results"]);
      } catch (error) {
        console.error("Emoji search error:", error);
        setSearchResults(["Error searching"]);
      }
    });
  }, [deferredSearchQuery]);

  const handleEmojiSelect = useCallback((emoji) => {
    setText((prev) => prev + emoji);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const handleChange = useCallback((e) => {
    const cleanText = DOMPurify.sanitize(e.target.value);
    if (cleanText.length <= 100) {
      setText(cleanText);
    }
  }, []);

  const handleCopy = () => {
    if (navigator.clipboard && text.trim()) {
      navigator.clipboard.writeText(text).then(() => {
        setAlert(true);
        setTimeout(() => setAlert(false), 2000);
      });
    }
  };

  return (
    <section className="section mt-6">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-three-fifths">
            <div className="card p-5 has-background-white-ter">
              <h2 className="title has-text-weight-semibold is-5 has-text-dark has-text-centered">
                Emoji Picker 😍
              </h2>
              <div className="is-flex is-align-items-center">
                <button className="button has-background-dark is-medium" onClick={() => setShowPicker((s) => !s)}>
                  {showPicker ? <FaTimes /> : <FaSmile />}
                </button>
                <div className="control has-icons-left ml-3" style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="input has-background-dark has-text-white"
                    placeholder="Search emojis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="icon is-small is-left">
                    <FaSearch />
                  </span>
                </div>
              </div>
              {showPicker && <EmojiPicker onSelect={handleEmojiSelect} />}
              {isPending ? (
                <div className="mt-2 hash-text-dark">
                  <p>🔄 Searching...</p>
                </div>
              ) : (
                searchResults.length > 0 && (
                  <div className="mt-2">
                    {searchResults[0] === "No results" || searchResults[0] === "Error searching" ? (
                      <p>{searchResults[0]}</p>
                    ) : (
                      searchResults.map((emoji, index) => (
                        <span
                          key={index}
                          className="emoji"
                          style={{ fontSize: "1.5rem", cursor: "pointer", margin: "5px" }}
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </span>
                      ))
                    )}
                  </div>
                )
              )}
              <textarea
                className="textarea has-background-dark has-text-white mt-3"
                placeholder="📝 Emoji..."
                value={text}
                rows="5"
                onChange={handleChange}
                spellCheck={false}
                autoComplete="off"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              />
              <div className="mt-3 is-flex is-align-items-center">
                <button className="button has-background-dark" onClick={handleCopy} disabled={!text.trim()}>
                  <FaClipboard />
                </button>
              </div>
              {alert && (
                <div className="notification has-background-primary-dark mt-3">
                  📋 Emoji copied to clipboard
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;
