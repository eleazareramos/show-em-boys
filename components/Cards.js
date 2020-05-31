const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    margin: 5,
    height: 100,
    width: 65,
    border: '1px solid grey',
    padding: 3,
  },
}

const PNG_BASE_URL = 'https://deckofcardsapi.com/static/img/'

const Cards = (props) => {
  const { cards, revealed } = props

  const cardImageSrc = (card) =>
    revealed
      ? PNG_BASE_URL + card + '.png'
      : 'https://cdn.shopify.com/s/files/1/0200/7616/products/playing-cards-bicycle-rider-back-1_1024x1024.png?v=1535755695'

  return (
    <div style={styles.container}>
      {cards.map((c, i) => {
        let card = c
        if (card === 'AD') {
          c = 'aceDiamonds'
        }
        return card === '' ? (
          <div key={i} style={styles.card} />
        ) : (
          <img key={i} style={styles.card} src={cardImageSrc(c)} />
        )
      })}
    </div>
  )
}

export default Cards
