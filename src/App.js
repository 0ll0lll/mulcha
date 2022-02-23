import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [inputValues, setInputValues] = useState(['', '', '', '']);
  const [secret, setSecret] = useState([]);
  const [history, setHistory] = useState([]);
  const [dots, setDots] = useState([]);
  const [plusses, setPlusses] = useState([]);
  const [attempts, setAttempts] = useState(-1);
  const [showInfo, setShowInfo] = useState(true);

  const form = useRef();
  const historyEl = useRef();

  const replaceItem = (index, newItem) => {
    setInputValues((prev) => {
      prev[index] = newItem;
      return [...prev];
    });
  };

  const generateRandomNumbers = () => {
    const tempArr = [];

    for (let i = 0; i < 4; i++) {
      tempArr.push(Math.floor(Math.random() * 10));
    }

    const enc = tempArr.map((i) => btoa(i));

    return enc;
  };

  const inputChangeHandler = (e, index) => {
    // const inputValue = Array.from(e.target.value).at(-1); // This beautiful thing doesn't have enough support 😓
    const lastItem = Array.from(e.target.value)[Array.from(e.target.value).length - 1];
    replaceItem(index, lastItem);

    index < 3 && form.current.elements[index + 1].focus();
  };

  const inputChangeKeyHandler = (e, index) => {
    const inputs = form.current.elements;

    if (e.code === 'Backspace') {
      replaceItem(index, '');
      if (index > 0) {
        e.preventDefault();
        inputs[index - 1].focus();
      }
    }
    if ((e.code === 'ArrowRight' || e.code === 'Enter') && index < 3) {
      e.preventDefault();
      inputs[index + 1].focus();
    }
    if (e.code === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputs[index - 1].focus();
    }
    if (e.code === 'Enter' && inputValues.every((value) => value.length !== 0)) {
      check();
    }
  };

  const check = () => {
    let plusses = 0;
    let dots = 0;
    const temp = secret.map((i) => +atob(i));
    const tempUser = inputValues.map((i) => +i);

    for (let i = 0; i < 4; i++) {
      if (+atob(secret[i]) === +inputValues[i]) {
        plusses++;
        temp[i] = '+';
        tempUser[i] = '';
      }
    }

    for (let i = 0; i < 4; i++) {
      if (temp.includes(tempUser[i])) {
        dots++;
        temp[temp.indexOf(tempUser[i])] = '.';
      }
    }

    setDots((prev) => [...prev, dots]);
    setPlusses((prev) => [...prev, plusses]);
    setAttempts((prev) => prev + 1);
    setHistory((prev) => [...prev, inputValues]);

    setInputValues(['', '', '', '']);
  };

  const restart = () => {
    setHistory([]);
    setDots([]);
    setPlusses([]);
    setAttempts(-1);
    setSecret(generateRandomNumbers());
  };

  useEffect(() => {
    setSecret(generateRandomNumbers());

    if (window && window.localStorage.getItem('hiddenInfo')) {
      setShowInfo(false);
    }
  }, []);

  useEffect(() => {
    if (historyEl.current) {
      historyEl.current.scrollTop = historyEl.current.scrollHeight;
    }

    if (form.current) form.current.elements[0].focus();
  }, [history]);

  return (
    <div className="bg-white flex flex-col items-center justify-end h-screen w-screen font-mono">
      <button
        onClick={restart}
        className="bg-gray-400 hover:bg-black text-white text-sm px-4 py-1 absolute left-10 bottom-0 md:bottom-8"
      >
        restart
      </button>

      <div className="text-xs absolute left-10 top-8 mr-10 md:mr-0">
        <p className="mb-2">(ノಠ益ಠ)ノ彡┻━┻</p>
        {showInfo && (
          <p className="mb-2">
            - You need to guess the 4 digit secret code. <br />
            - (+) means you got the right digit in the right place. <br />
            - (·) means you got the right digit, but it's in the wrong place. <br />
            - You won't know which numbers gave you (+) or (·) <br />
            - Yes, there might be repetitive digits.
            <br />
            - Yes, there might be 0's <br />- Good luck! <br />
          </p>
        )}

        <button
          onClick={() => {
            setShowInfo(!showInfo);
            window.localStorage.setItem('hiddenInfo', true);
          }}
        >
          {showInfo ? ' hide info 👆' : 'show info 👇'}
        </button>
      </div>

      <div className="w-72">
        {history.length >= 1 && (
          <div style={{ height: '50vh' }} className="overflow-y-scroll flex flex-col justify-end">
            <div ref={historyEl} className="overflow-y-auto">
              {history.map((i, index) => (
                <div key={index} className="flex w-max pb-6 items-center border-b last:border-0 relative mt-6">
                  {history[index].map((item, index) => (
                    <p key={index} className="text-gray-400 w-10 flex-col text-center mx-1 font-light">
                      {item}
                    </p>
                  ))}
                  <div className="ml-2">
                    <p className="color-black">+ {plusses[index]}</p>
                    <p className="color-black">· {dots[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {plusses[attempts] !== secret.length && (
          <form ref={form} className="flex w-max mb-32 md:mb-60 mt-6">
            {inputValues.map((value, index) => (
              <input
                key={index}
                className="h-10 w-10 border border-black flex justify-center items-center text-black text-center mx-1"
                type="number"
                value={value}
                onChange={(e) => inputChangeHandler(e, index)}
                onKeyDown={(e) => inputChangeKeyHandler(e, index)}
              />
            ))}
            {inputValues.every((value) => value.length !== 0) && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  check();
                }}
                className="text-2xl h-10 w-10 flex justify-center items-center font-serif text-black text-center mx-1"
              >
                {'>'}
              </button>
            )}
          </form>
        )}
      </div>
      {plusses[attempts] === secret.length && (
        <p className="text-green-400 mb-32 md:mb-60 mt-6">
          Congrats! It took you <span className="font-bold">{attempts + 1}</span>{' '}
          {attempts + 1 === 1 ? 'attempt' : 'attempts'}.
        </p>
      )}
    </div>
  );
}

export default App;
