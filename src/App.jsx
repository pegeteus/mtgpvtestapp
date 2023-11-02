import { useState, useEffect } from "react"
import axios from "axios"
import './App.css'

const SearchBox = ({searchText, onChange, onSubmit, searchAlert}) => {
  return ( 
    <div>
      <h2>Type name of the card</h2>
        <div style={{ color: 'red' }}>{searchAlert}</div>
        <form onSubmit={onSubmit}>
          <input id="search-input" type="text" value={searchText} onChange={onChange} />
          <input type="submit" value="Submit" />
        </form>
    </div>
  )
}

const Cardbox = ({card}) => {
  let cardName = card.name
  let oracleText = card.oracle_text
  let cardImageUrl = card.image_uris
  let legalities = card.legalities

  console.log(card, cardName, oracleText, cardImageUrl)

  return ( 
    <div align="left">
      <h2>Here is info's for found card</h2>
      <img src={cardImageUrl.small} ></img>
      <div>
      <b>Name:</b> {cardName} <br />
      <b>Oracle text:</b> {oracleText} <br />
      <h3>Legality</h3>
        <ul> {
          Object.entries(legalities)
            .map(format => <li key={format}>{format[0]} : {format[1]}</li>)
        }</ul><br />      
      </div>
    </div>
  )
}

const tooLongUrl = 'https://api.scryfall.com/cards/named?fuzzy=aust+com';
const baseUrl = 'https://api.scryfall.com/cards/named?fuzzy='

const initCardValue = { 
  "name" : "",
  "oracle_text" : "",
  "image_uris": {
    "small": ""
  },
  "legalities": {
    "" : ""
  }
}


function App() {
  const [searchedCard, setSearchedCard] = useState(initCardValue);
  const [searchText, setSearchText] = useState("")
  const [searchAlert, setSearchAlert] = useState("")

  const handleTextChange = (event) => {
    console.log(event.target.value)
    setSearchText(event.target.value)
  }

  const handleCardSearch = (event) => {
    event.preventDefault();
    const searchUrl = baseUrl.concat(searchText)
    console.log("Searching: ", searchText, ", search url: ", searchUrl)
    
    axios
        .get(searchUrl)
        .then(response => {
          console.log('promise fulfilled')
          setSearchedCard(response.data)
          setSearchAlert("")
        })
        .catch(error => {
          setSearchAlert("Card not found or ambiguous searh word(s).")
        })
  }
  /*
  useEffect(() => {
    console.log('effect');
    axios
      .get(tooLongUrl)
      .then(response => {
        console.log('promise fulfilled');
        setSearchedCard(response.data);
      })
  }, [])
  */
  if ({searchedCard} != []) {
    console.log({searchedCard})
  }

  return (
    <>
      <div id="main">
        <SearchBox searchText={searchText} 
          onChange={handleTextChange} 
          onSubmit={handleCardSearch} 
          searchAlert={searchAlert}/>
        <Cardbox card={searchedCard}/>
      </div>
    </>
  )
}

export default App
