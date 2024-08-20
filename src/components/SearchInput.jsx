import React, { useEffect, useState } from "react";
import "../components/SearchInput.css";
import axios from "axios";

const SearchInput = () => {
  const [inputText, setInputText] = useState("");
  const [data, setData] = useState([]);
  const [records, setRecords] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const fetchdata = async () => {
    try {
      const response = await axios.get(
        "https://dws5njpmv35zp.cloudfront.net/Data.json"
      );
      setData(response.data);
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchdata();
  }, []);

  const handleInputChange = (e) => {
    const query = e.target.value.toLowerCase();
    setInputText(query);

    const filteredRecords = data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(query)
      )
    );

    setRecords(filteredRecords);
    setFocusedIndex(-1); // Reset focus index on input change
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");

    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleKeyDown = (e) => {
    if (records.length === 0) return; // Do nothing if no cards

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prevIndex) =>
        prevIndex < records.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (e.key === "Enter" && focusedIndex !== -1) {
      handleCardClick(focusedIndex);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [records, focusedIndex]);

  useEffect(() => {
    if (focusedIndex !== -1) {
      const element = document.getElementById(`card-${focusedIndex}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [focusedIndex]);

  const handleCardClick = (index) => {
    setFocusedIndex(index);
  };

  return (
    <div className="main-container">
      <div className="input-container">
        <input
          className="input"
          type="text"
          value={inputText}
          onChange={handleInputChange}
        />
      </div>
      <div className="scrollable-content">
        {records.length === 0 ? (
          <div className="empty-card">No results found</div>
        ) : (
          records.map((item, index) => {
            const itemMatch =
              item.items &&
              item.items.some((item) => item.toLowerCase().includes(inputText));

            return (
              <div
                key={item.id}
                id={`card-${index}`}
                className={`input-cards ${
                  index === focusedIndex ? "focused" : ""
                }`}
                onClick={() => handleCardClick(index)}
              >
                <p>{highlightText(item.id.toString(), inputText)}</p>
                <p>{highlightText(item.name, inputText)}</p>
                <p>{highlightText(item.address, inputText)}</p>
                {itemMatch && (
                  <p className="item-message">
                    {inputText ? `${inputText} found in items` : ""}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SearchInput;
