import { useState } from "react"
import axios from "axios"
import './App.css'

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const SearchBox = ({searchText, onChange, onSubmit, searchAlert, autocomplete}) => {
  const showAutocomp = autocomplete.length > 1

  return ( 
    <div>
      <h2>Type name of the card</h2>
        <div style={{ color: 'red' }}>{searchAlert}</div>
        <form onSubmit={onSubmit}>
          <input id="search-input" type="text" list="cards" value={searchText} onChange={onChange} />
          { showAutocomp ?
              <datalist id="cards">
                {Object.entries(autocomplete)
                  .map(name => <option key={uuidv4()} value={name[1]}>{name[1]}</option>)}
              </datalist>
              : null
          }
          <input type="submit" value="Submit" />
        </form>
        <p style={{ color: 'gray', fontSize: '11px' }}>
        (Search is approximate, so search "gaeaslie"
           would found card "Gaea's Liege".)
        </p>
    </div>
  )
}

const Cardbox = ({card, rulings, rulingsAlert}) => {
  let cardName = card.name
  let oracleText = card.oracle_text
  let cardImageUrl = card.image_uris
  let prices = card.prices
  let cardmarket = Object.entries(card.purchase_uris)
                    .filter(uri => uri[0] == "cardmarket")
                    .map(uri => uri[1])
  let showCardmarketLink = cardmarket != ""
  let showRulings = rulings.length > 0
  let legalities = card.legalities
  console.log(rulings.map(x=>x), prices, uuidv4())

  return ( 
    <div align="left">
      <h2>Here is info's for found card</h2>
      <img src={cardImageUrl.small} ></img>
      <div>
      <b>Name:</b> {cardName} <br />
      <b>Oracle text:</b> {oracleText} <br />
      <h3>Rulings:</h3>
      <div style={{ color: 'red' }}>{rulingsAlert}</div>
        { showRulings ?
          rulings.map(ruling => <li key={uuidv4()}><b>{ruling.source}</b> : {ruling.comment}</li>)
          : null
        }
      <h3>Prices:</h3>
        <ul>{
          Object.entries(prices)
            .filter(price => price[0] == "eur" || price[0] == "eur_foil")           
            .map(price => <li key={uuidv4()}>{price[0]} : {price[1]}&euro;</li>)
        }</ul>
      { showCardmarketLink ? 
        <b><a href={cardmarket}>Cardmarket link</a></b> 
        : null 
      }
      <h3>Legality</h3>
        <ul> {
          Object.entries(legalities)
            .filter(legality => legality[1] == "legal")
            .map(legality => <li key={uuidv4()}>{legality[0]} : {legality[1]}</li>)
        }</ul>     
      </div>
    </div>
  )
}

const baseUrl = 'https://api.scryfall.com/cards/named?fuzzy='
const autocompBaseUrl = "https://api.scryfall.com/cards/autocomplete?q="
const rulingsUrlStart = "https://api.scryfall.com/cards/"
const rulingsUrlEnd = "/rulings"
const searchAlertText = "Card not found or ambiguous searh word(s). Check suggestions for help."
const rulingAlertText = "Card rulings not found."

const initCardValue = {
  "id" : "",
  "name" : "",
  "oracle_text" : "",
  "image_uris": {
    "small": ""
  },
  "prices": {
    "" : ""
  },
  "purchase_uris": {
    "" : ""
  },
  "legalities": {
    "" : ""
  }
}

const initAutocompValue = {}
const initRulings = {}

function App() {
  const [searchedCard, setSearchedCard] = useState(initCardValue)
  const [cardAutocomp, setCardAutocomp] = useState(initAutocompValue)
  const [rulings, setRulings] = useState(initRulings)
  const [searchText, setSearchText] = useState("")
  const [searchAlert, setSearchAlert] = useState("")
  const [rulingsAlert, setRulingsAlert] = useState("")

  const handleTextChange = (event) => {
    setSearchText(event.target.value)
  }

  const handleCardSearch = (event) => {
    event.preventDefault();
    const searchUrl = baseUrl.concat(searchText)
    const autocompUrl = autocompBaseUrl.concat(searchText)
    
    axios
        .get(searchUrl)
        .then(response => {
          console.log('promise fulfilled')
          const cardData = response.data
          setSearchedCard(cardData)
          setSearchAlert("")

          const rulingsUrl = rulingsUrlStart.concat(cardData.id).concat(rulingsUrlEnd)

          axios
            .get(rulingsUrl)
            .then(response => {
              console.log('promise fulfilled')
              setRulings(response.data["data"])
              setRulingsAlert("")
            })
            .catch(error => {
              console.log(error)
              setRulingsAlert(rulingAlertText)
            })
        })
        .catch(error => {
          setSearchAlert(searchAlertText)
          console.log(error)

          if (searchText.length > 2) {
            axios
              .get(autocompUrl)
              .then(response => {
                console.log('promise fulfilled')
                setCardAutocomp(response.data["data"])          
              })
              .catch(error => {
                console.log(error)
              })
          }
        })
  }

  return (
    <>
      <div id="main">
        <SearchBox 
          searchText={searchText}
          autocomplete={cardAutocomp}
          onChange={handleTextChange} 
          onSubmit={handleCardSearch} 
          searchAlert={searchAlert}/>
        <Cardbox card={searchedCard} rulings={rulings} rulingsAlert={rulingsAlert}/>
      </div>
    </>
  )
}

export default App
