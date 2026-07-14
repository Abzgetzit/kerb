import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

export const metadata = {
  title: "Car Bids | Kerb Car",
  description:
    "Make private bids on cars listed on Kerb Car. Send the highest amount you would genuinely pay, visible only to the seller.",
};

const bidHeroImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAE3ArwDASIAAhEBAxEB/8QAHAABAAEFAQEAAAAAAAAAAAAAAAECAwUGBwQI/8QATBAAAgEDAQQHBAcFBQUGBwAAAAECAwQRBQYSITEHEyJBUWFxFIGRsRUyQmKhwdEWI1JTciQzQ4LwFzSSk7Jjc6LC0uElNUWDw+Lx/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEBAAICAwEBAQAAAAAAAAABEQISITEDQVFhE4H/2gAMAwEAAhEDEQA/AOtkAHZgAAAAACSAAAAEggAAAAAAAAAAAAAAAAAAABIIJAgkgAAABJAAAAAAAAJAAgAAAAAJIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJIAAAAAAAAAAAAAAAAAAAAAAAAAAkgkAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBIAAAACMgSRkAASQSAAAAAAAAAAAAgkAACAJAAAEACQCAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQSCAAJIAkAAQAAAAAAACQQAJBAAkEEgAQSABBIAEACQCAJAAAEAASQAJBBIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAJIAkgAAAAAAAAgkACCSgACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASQAAAAkEE5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEASAAABAEkAAAAAAAAgAoAAASQAABAEgAAAAAAAkFm7urextal3d16dChSWZ1Kkt2MfeaBqXSRd6m50NmbVUrdNqWp3cHuv/ALuH2vVk0dFXHlxLda5oW0W69anTS/jko/M5DW13UoW6oT1a9uWm3KdSrhybeXyxw8u4xEpXF7U7NCpXl4qDl+JcZ7Ox1tq9BoNqpq1omu5VU3+GTwV+kLZmhz1JTf3KU5fkcdrV5Qbj9Vrg0ljB4nUcp8OMn4sYdnY6nShs5T5Vbuf9Fs/zZ459Lmgxb3bbUJf/AG4L/wAxyKVSfHefAtfWWO7zZMOzrkumHR/s6bqEv88F+ZS+l7TMZ+h7731oHInPd5cCl1WTDa66ul7S89rRb3/nQZUul7RPtaRqCXlKD/M485vxKXMZF2uzx6XNms9q01Kn604v5SPbp+29PanU6OmbORq08xlUurq5oP8AcwWOEY5w5NvCb4LwZwnrGn4nbeifS6OkbJ3Gt3T3Hd5m5P7NGGfm95/AzfCzy2fU9c0zZ+nCld3detXlHeVNYlNr+J8lFeuDAvpP0dSaVvcSS71NP5ZNB1zVq2o6hWuKq/eV5dZNeGfqx/yxwjF9bJ/aaOs4ePLnfk8+HV6PSbs9Ulu1J16L+9BP5MzdjtJo2o4VtqFCUn9mUt1/B4OHTbr28oqOZw7SfzPFGMJPLzGa74vdf4DqTm+kQcL0fazXdDaVpfSr0VzoXPai/f3HRdnOkPTtZnG2vofR12+CjUl+7m/uy/JkyxuWVt5JACpBGQBIIJIAAAkEEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEEgCAAABAEggFAAZAAEBEgEASQSQAAAAkgkAA2orLeCHOMacqkniMVlsmqk1/anbTS9laShcb1xe1F+5s6TzOfg3/CvN+41nafpMcpy0zZiHW3Typ3csOFJZ5x8fV8PVmpW1rGlUndXNSVzeVXmdao96Um/Ue/SW4uajdantPexvderrqYPNGwpvFKn6+LPda07nUcQt6a6qPZ32sQj5L9EXrPQKlxNVr5OMOaoJ8X/V4ehmK1za6fTjGvWpW8IrEYtpYXki+vTG77ee10Cxt2pzi7ir/FU5e6PI8m02tLTLL2alLdr1liKXDcj3v9Cu72r0u2pt06k7iX8NOD4+9mh6pf1tSvqlzWliVR8ItYwu5IDyTqy8eZt2iaFSeiy9rhKFa7Se9H60I5ylx8ebNa0PTpanrlvazg3De36i+7Hi/wBPedJqQlH7LIVoe0Wk2ekRpdVcVqlWq21GaWFFc3wRr05vuZsG205vV6MX9VUFu/F5Ndalj6rCx6dP0251WpVp225KpThv7rlhy44wvM8k1OnOUJxcJReHGSw0zMbJVnS1+mnHs1ITi34cM/kX9roW1bVYVLeUHOVP964yz2k+GfPBDfONfyVwpuazvIh0ZLm/wKe3T4rKT7yK9llptW+v7aztm5V7mrGnBY728fmd12ynQ0LY2hpFHEKc1C2WOH7qCzP4qOP8xz7of0eWo7TT1Os26OnU3KOVn95LKj8FvP4GU6WtTVfUoWEJSao0408ecu3P/wAKgveJ5rXqNNqVZ1Kkpt5cm2zI2Nra3Nvvzj24vElvs2zo/wBl9K1eyqapqdHrsVNyFGUsQWEm20ufPlyN0rrZLTZO3rrSbaSSbpyjCLx3cDd545T47Y4zOCtrmUY8Unw9DHXNN0rlvHZ5r0Oz17XYO+3pzjp8mlxlSzFr3xND210vQLWFK40TUVW7e5UtpNtpNPDTaXDPcJzlXpY1fdXc2JLejuzSlF80+8opTzBZzkvLEuB0Z9Nv2U29uNC3LPVZzutM5RrvtVLZef8AFD8UdWo1qVxRhWo1I1KdSKlCcXlST5NM+faa3eCbNv2D2jq6JqFLSbmopabdyapKT/3aq/D7svDuZiz7bl+nVgQCNJAAUJIJAAAgkEEgAAAAAAAAAAAAAAAkCASQAAAAAAAAAAAAAAAAAAAAAAAAAIAAAEASQAUARkASQAEAAABDko95R1jbxFe8aq4C1lvvbJxIz2MXMpc2RvL/AEijdfiTuE7LirfQ30RuE7qHamPFqVnLUFSSu69t1bbzReG8ng1bZ+er6X9HT1m9o0ZLFTqow3qnk21y8u/vM5uoYRlWk2fRdpFlTcIX160+Ms7icn4t44mRttg9ItayrQncupHlKVTODZtz3E7sVzWS7UyMFU2V06qsVJ3EvLrpr5M88tgNn5venp0Jt/am5N/izZN59yx6DEmNpka2tgNnY/8A0u1frBv8ymWwGzLeZaZbL0pf+5sypN82VKlFeZNXGrLYPZaLz9GUm/KKRX+w+zDWPoKlP1TNnSiuSQcscMjTGqPYDZl8tm7Zv7zf6lH+zvZyb7Wz9kl4b0/yZt3F93xG6+9jRqUujbZiax9DWkf6Z1f/AFFiXRZstLnY7v8ARXqr/wAxue4vMndXgDGiT6JNl5v6t1D+m5l+bZbl0PbNOUN2eo4z2v7Qkkv+E37AwBjtA2f0zZqwdlpNB0ac5b85Sk5SnLGMtvyR8/7VavK82ivNQrVHu1rmo4KKzlJpJeS/Q+kmk4uL71jgabLos2RbUqmnVazXLfuJ4+CwPQ5nst0iXuhWtW0s9MpXcZtTxVquLi+Xd7vgZh9KG1dV5oaLp0PBtylj/wARulfo20FUl9H0PZJQ5Qy5Qfqm8+/JNlplrpUlQv8AQ7OcO6p1SefR95rN86zuNIqbe7f3EM01pVBePYWP+KTMTea1tBqdrWp65qcLntKUKdPccU13rdR22hpmjygqlDT7NJ8mqEV+Rf8Ao+z7rO3/AOVH9CTIt2vnvcl2nh8/AqgfQULG0fGNCg/SnH9Ct2Vr321D/lR/Q33Y6OARcVJZfdjmLup1dlUqKSTppTT80zvk9Ps5cJWlu/WlH9Dz1NC0mrF9bptpJd+aMf0Hdei3s7qD1PZ6yvHLenOklN+LXDJk+ayizaWdrY2qt7KjToUU21CmsLL5kVbWnUqRq8VUg8xnGTT9PNeTM9msXySE95ZxgG2UggkKEkEgAAQSAAAAAAAAAAAAAAEgQAAAAAEkAAAAAAAAAAAAAAAAAAQSQAAAAgAoEABAZIBRIIPLqFedvQcotR4NuT+ykQeqU1HnwLUqjfBcEaZa7Q3On6rOMozv7K5qreUJp1Leb4ZWXxg+GfDmYfaDpUtKNzK10+nXuYQzv1KFRQTecYU2m3x4cF72ZtWOmRozfFxlj0LnVvluv4HEJ9I1GUu3pF3xeOOot+vNdxTDpA0+pjFnqtBtN71O8zhePNE/6uu4qKXAxmsa/baNUp0atOrUrVqcp0406U5KWMcMxT4tvgvJmh7O69d6vGdbR9bv3Kg4udC9TkknnGU28p4a4NMymt7f19Ii6N5eWdhVayo0IyrVWvHdfBerGZ5TfptWj3+o6hUrVLzTXY2yUep63s1ZvHabjl7q8M8fIymDi1z0nQnJL6V1utvcurhCn8pI8UukOnUTau9eljvdz/8AuTJ+rruo4HB/2848dU12lnliq5f/AJD1WW3NxKru0drL6nLPCN3lR+L3l8cFz+m/x2/BOMGlaLtjqdFRp61ZyuaTSaubaHbx4uK4SXnH4M9130k7HWbcamtU5zX2KNOc5Z8OCM2We1l1s+BumlPpQsK73dL0LXNRb5OlZtJ+9sS2w2wuF/Y9g61GL5TvbpQ/DCIN1xgZOfXGs9Idbl+zmnL/ALSupNfGT+R5pU9sLlf2zpAsLXP2bSEfyiXB0xJvkm/Qh5jw3ZNvkkuJy2ezN5Xlm86R9Sq5+zTdRZ/FHkutE2Y02M1qG0etVm8SliUu1w9Rhrrypyf1k15Inc3VwjhehwR/slUlUlY0dfunDi8XCjhfHJlNmbKrr3tM9Bu9T06pa7v95qU23nOOCi1jgXrU7R2YGhbDbT7Sajq93o+p0aF5SscxrX0Go7k1yi2uzNvyw1zZvuVyzx8DNmL7QQUutHOI8SmUqi4uDx6MC5kpcvIoVVSJKDqqON6UY55ZeMklmtbUbjd62G9u8uLXyLrAN4LVaEK1NwnDeTLoA89vQVvBxgpNZzxZdqVasaU+rpKcscIuWE/LPcXAB4IXd3O8jQ+j50oNZdXe7EfL1PbJ1M8MFWQ2BbfW/wCkUzVzKDVOooy7m45XwL2UN9AeO3p6g6lSVzUppZxBQXd5npUZrnLPuLikiW0u8DAbTVL6xs46vZSbnYPfq04r+9o/bTXlz9zM5GUZwjUi8xmlKL8U+KKamJwlGSUotYafJrwKLWlC3taVCnncpRUI5fclhfga4+y3wvAEHRhUCESRUgIEEgAAAAAAAAAAAABJBIVAJICAAAAEgQAAAAAAAAAAAAAAAAQSQAAIAAEFQIAKAAAcjVNs9XlYTpUadTq6lSjPttpKCfJvPDi1g2mpNU4N9/ceWVCjVuKdzKlCdejnq6kopyjnnh+Znl+LHG7eydPUrS4qXMf7VeJScE4vO7jO9l5zlcu40Cr7Ra1lT33F05peji2v1O93ewFhC+jd2t5e2sJTU5UYVswlh5xhrgjlXSFptxa7RXV1Khu0KtTeThDChLOWn6tt+855Wtal7RV3N1zytxx4rubKpXNRqpwj2t1NqPJLwKNxtcPCS/MiS4S/pTMq6N0Y39ei9ZuI21KpiNNtOTjhRU2klh55Gg3N/cXtetc1579a4q9ZUqS4tvn8OP4I3Xo5uoWvtaquEYXk1FTnLdSUINy9X2lwNR1vSbvRNUuNPu6e5VoTXfwcWsxa8msMu0xYncrrqslRguzuqKziPdn/AF4lDupOlSgoRWG22ubKGu3UXlkpxiNN+vzJo9Mbpu4nV6qnuxy1Tw91cMFFO5dO3nFU4ScmlvSWWsPP4luMX1lVY7mevSdLuNWuFa26w95SnNrs0498n/riB0jYC/2ht9loQs7+lbUKlecob9uqjiuC7OXhLKfvNdp7U6pQutRq0NXnT9ou6lRypwipTecb3BcM47joWmbN315s9O20mUKEKdu6VtUrZSlLGE/jxzyyaxYdF20trRqUbjR7O4jPd4vUNxrGe9epdGuXW0+uVoSb1a+rJPHbqzx8zFvW9TkpN3s4Sz9vvXqdMtdgNobazqWlPRNO9nqyU50qmq1JRcksZxjnjvPZpfRvqVO6jVnpehWDi8qr1ta7lHzUJNRb9eA2pjnkKF/LTGn7XK6q4lbyoRqOdbL45S5RS5PCz58xqSvtN0+hTuKlw7htqphTSp+Cc+Tl5LkdrXR9otVOV9V1C8rz41K072pDff8ATBqKXkkavcdHm0FFajp9nHSrrSbq5VWnSvrmvKUIx+quHhnx4jaOU09W1Szv406jqqpTluyhJbsn3Y48mZzT/pP6QoU6VpWnc1Jdim5Qjv8ArxeV4nQKfF7z95ueSxRp06VKFKnCMIQioxjFYSS4JIuYOsmM6ryCkkqKgESRUokhEkVIAIAAAAAAAAAAAAAAAAAAAAAASQAJAICpAARAAAAAAAAIBJAEEMqBRQyMMrwMF1FtplLTL2CMDTHncZFDg8cz1YI3UXUxi69Cs12WzGXNvcLvbNldPJQ6CfNF1MaNde0wz2JGGu728p53IZfnE6bOxpT+tBP3HnqaV6d4Z5r6CQjOWlx9X3p81x8g4vM5mzVw1czV0UZ9rxoiNVzsmtwybnNLujAeD9KyztqqVOXnjTjE0YJxlhp0ZzPv5MXFAt1qm3vUb03o1xGW8t0pRQB17zmSPCv1Z2a6xZ7uWxNhO+Kgd4HfuG3eWSTc/KU5/Lzg1/iQ2Z4lXlTq2zS4Mq9lNnDnu5qfrclp4+50p+xiTeD1vSMXknFZUrdU1aFZa9OSN9JfvgzneX7W3G8KzXr1H2TUYz+KI+a1Z3Tvn6k+0ktj8mRsvJ+13QqWs0o2qtVmlqa6uXh3dn03S0/W8PCJbY0f8AG9oYaQ2S+KNmdJVnFnA3TyymjCeZYYbJUggqQRkgSCCSAAAJBBIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBIAgAAAQRIEBUAGQABARIABEkkAAAAJIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEkgAAAAAAAAAAJIAAAQSAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAAAAASQSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQSAJAAAEAAAAAAAAAAgkAJBAAkEEgAQSABBIAEACQCAJAAAEAASQAJBBIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEkgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//Z";

function Icon({ name }) {
  const icons = {
    car: <path d="M5 15h14l-1.8-5.2A3 3 0 0 0 14.4 8H9.6a3 3 0 0 0-2.8 1.8L5 15Zm1.5 0v3m11-3v3M8 18h.01M16 18h.01" />,
    bid: <path d="M20 12l-8 8-8-8V4h16v8Zm-9-4h2m-1-1v6m-3-3h6" />,
    new: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />,
    sell: <path d="M4 7h10l6 6-7 7-9-9V7Zm4 4h.01" />,
    electric: <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />,
    finance: <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M3 10h18M7 15h3" /></>,
    guide: <><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z" /><path d="M9 8h6M9 12h5" /></>,
    heart: <path d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.8 1.9Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    location: <><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
    pound: <path d="M15 6.5a3.5 3.5 0 0 0-6.2 2.2V18m-2.3-5.5h7M6.5 18h10" />,
    mileage: <><path d="M5 16a7 7 0 1 1 14 0" /><path d="M12 16l4-5M4 20h16" /></>,
    fuel: <><path d="M7 3h7v18H7Z" /><path d="M9 7h3M14 8h2l2 2v8a2 2 0 0 0 4 0v-6l-3-3" /></>,
    transmission: <><circle cx="6" cy="7" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="12" cy="17" r="2" /><path d="M8 7h8M12 9v6" /></>,
    filters: <path d="M4 7h10m4 0h2M4 17h2m4 0h10M14 5v4M8 15v4" />,
    shield: <><path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6l8-3Z" /><path d="M9 12l2 2 4-5" /></>,
    tag: <><path d="M4 7h10l6 6-7 7-9-9V7Z" /><path d="M8 11h.01" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></>,
  };

  return (
    <svg className="bidIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function BidsPage() {
  return (
    <main className="bidsPage">
      <header className="bidsTopbar">
        <Link href="/" className="bidsLogo">Kerb</Link>

        <nav className="bidsNav" aria-label="Main navigation">
          <Link href="/browse"><Icon name="car" /> Browse cars</Link>
          <Link href="/bids" className="active"><Icon name="bid" /> Bids</Link>
          <Link href="/new-cars"><Icon name="new" /> New cars</Link>
          <Link href="/sell-car"><Icon name="sell" /> Sell your car</Link>
          <Link href="/electric-cars"><Icon name="electric" /> Electric</Link>
          <Link href="/cars-on-finance"><Icon name="finance" /> Finance</Link>
          <Link href="/guides"><Icon name="guide" /> Guides</Link>
        </nav>

        <div className="bidsActions">
          <Link href="/saved"><Icon name="heart" /> Saved</Link>
          <Link href="/account"><Icon name="user" /> My account</Link>
          <Link href="/post-car" className="postButton"><Icon name="plus" /> Post your car</Link>
        </div>

        <SiteMenu />
      </header>

      <section className="bidsHero">
        <img className="heroCar" src={bidHeroImage} alt="Kerb white BMW bid hero car" />

        <div className="heroText">
          <h1>Make your best bid</h1>
          <p>Browse cars open to private bids and offer the highest amount you would genuinely pay.</p>
          <div className="privacyLine"><Icon name="shield" /> Your bid is private — only the seller can see it.</div>
        </div>

        <form className="bidSearch" action="/bids">
          <label><Icon name="location" /><span>Location</span><strong>Any location</strong></label>
          <label><Icon name="car" /><span>Make</span><strong>Any make</strong></label>
          <label><Icon name="car" /><span>Model</span><strong>Any model</strong></label>
          <label><Icon name="pound" /><span>Max asking price</span><strong>Any price</strong></label>
          <button type="submit">Search bid cars</button>
        </form>

        <div className="filterPills">
          <button className="active" type="button"><Icon name="pound" /> Any price</button>
          <button type="button"><Icon name="mileage" /> Mileage</button>
          <button type="button"><Icon name="fuel" /> Fuel type</button>
          <button type="button"><Icon name="transmission" /> Transmission</button>
          <button type="button"><Icon name="filters" /> More filters</button>
        </div>
      </section>

      <section className="resultsHeader">
        <div><h2>Cars open to bids</h2><span>0 cars</span></div>
        <label>Sort:<select defaultValue="newest"><option value="newest">Newest</option><option value="price-low">Price low to high</option><option value="price-high">Price high to low</option></select></label>
      </section>

      <section className="emptyBids">
        <div className="emptyIcon"><Icon name="bid" /></div>
        <h2>No bid cars yet</h2>
        <p>Cars that sellers open to private bids will appear here. Buyers will be able to make their best private offer, and only the seller will see it.</p>
        <div className="emptyActions"><Link href="/browse">Browse cars</Link><Link href="/post-car">Post your car</Link></div>
      </section>

      <section className="bidSteps">
        <div><h2>Private bids,<br />simple decisions</h2><p>No payment is taken when you submit a bid.</p></div>
        <article><span>1</span><Icon name="car" /><div><strong>Choose a car</strong><p>Find a car you love that’s open to private bids.</p></div></article>
        <article><span>2</span><Icon name="tag" /><div><strong>Send your best bid</strong><p>Offer the amount you would genuinely pay.</p></div></article>
        <article><span>3</span><Icon name="mail" /><div><strong>The seller responds</strong><p>The seller will review your bid and get back to you.</p></div></article>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  .bidsPage { min-height: 100vh; background: #f7f9fd; color: #0b1533; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding-bottom: 34px; }
  .bidsPage a { color: inherit; text-decoration: none; }
  .bidIcon { width: 18px; height: 18px; flex: 0 0 auto; }
  .bidsTopbar { height: 72px; display: flex; align-items: center; gap: 24px; padding: 0 52px; background: rgba(255,255,255,.96); border-bottom: 1px solid #e6edf8; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(14px); }
  .bidsLogo { color: #0048ff; font-size: 36px; font-weight: 950; letter-spacing: -2px; line-height: 1; }
  .bidsNav, .bidsActions { display: flex; align-items: center; gap: 18px; }
  .bidsNav { flex: 1; min-width: 0; }
  .bidsNav a, .bidsActions a { display: inline-flex; align-items: center; gap: 8px; color: #111a35; font-size: 14px; font-weight: 900; white-space: nowrap; padding: 10px 0; }
  .bidsNav a.active { color: #0048ff; position: relative; }
  .bidsNav a.active:after { content: ""; position: absolute; left: 0; right: 0; bottom: -17px; height: 3px; border-radius: 999px; background: #0048ff; }
  .bidsActions { margin-left: auto; }
  .bidsActions .postButton { height: 48px; padding: 0 20px; border-radius: 13px; background: #0048ff; color: white; box-shadow: 0 12px 28px rgba(0,72,255,.2); }
  .bidsTopbar :global(.siteMenu) { display: block; }
  .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: min(1432px, calc(100% - 104px)); margin-left: auto; margin-right: auto; }
  .bidsHero { position: relative; margin-top: 12px; min-height: 344px; border: 1px solid #dde7f7; border-radius: 18px; overflow: hidden; background: linear-gradient(105deg, #f8fbff 0%, #eef5ff 100%); padding: 32px 40px 24px; box-shadow: 0 12px 34px rgba(20,40,80,.05); }
  .bidsHero:before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,.82) 31%, rgba(255,255,255,.26) 56%, rgba(255,255,255,0) 100%); pointer-events: none; }
  .heroText { position: relative; z-index: 2; width: 440px; }
  .heroText h1 { margin: 0 0 12px; font-size: 38px; line-height: 1; letter-spacing: -1.45px; font-weight: 950; }
  .heroText p { margin: 0; color: #34415d; font-size: 15px; line-height: 1.55; max-width: 390px; }
  .privacyLine { margin-top: 24px; display: inline-flex; align-items: center; gap: 12px; color: #35425e; font-size: 14px; font-weight: 700; }
  .privacyLine .bidIcon { color: #0b1533; }
  .heroCar { position: absolute; z-index: 0; top: 0; right: 0; width: 64%; height: 100%; object-fit: cover; object-position: right center; filter: none; }
  .bidSearch { position: absolute; z-index: 3; left: 40px; right: 86px; bottom: 63px; min-height: 88px; display: grid; grid-template-columns: 1.13fr 1.05fr 1.05fr .92fr 160px; gap: 14px; align-items: center; background: white; border: 1px solid #dce6f6; border-radius: 16px; padding: 14px 16px; box-shadow: 0 18px 48px rgba(20,45,85,.09); }
  .bidSearch label { min-width: 0; min-height: 60px; border: 1px solid #dfe7f5; border-radius: 14px; display: grid; grid-template-columns: 36px 1fr; align-content: center; column-gap: 10px; padding: 11px 14px; background: #fff; }
  .bidSearch label .bidIcon { grid-row: span 2; align-self: center; color: #07142d; }
  .bidSearch span { color: #62708b; font-size: 12px; font-weight: 900; }
  .bidSearch strong { color: #07142d; font-size: 14px; font-weight: 950; }
  .bidSearch button { height: 50px; border: none; border-radius: 12px; background: #0048ff; color: #fff; font-size: 14px; font-weight: 950; cursor: pointer; box-shadow: 0 10px 24px rgba(0,72,255,.22); }
  .filterPills { position: absolute; z-index: 3; left: 40px; bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .filterPills button { height: 36px; display: inline-flex; align-items: center; gap: 10px; border: 1px solid #d9e4f5; border-radius: 9px; background: white; color: #15213c; padding: 0 14px; font-weight: 850; cursor: pointer; box-shadow: 0 7px 18px rgba(20,40,80,.04); }
  .filterPills button.active { color: #0048ff; border-color: #0048ff; background: #f3f7ff; }
  .resultsHeader { margin-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
  .resultsHeader div { display: flex; align-items: baseline; gap: 14px; }
  .resultsHeader h2 { margin: 0; font-size: 20px; letter-spacing: -.45px; }
  .resultsHeader span, .resultsHeader label { color: #43516d; font-size: 13px; font-weight: 800; }
  .resultsHeader label { display: inline-flex; align-items: center; gap: 8px; }
  .resultsHeader select { border: none; background: transparent; color: #0b1533; font-weight: 950; outline: none; }
  .emptyBids { margin-top: 14px; min-height: 260px; border: 1px solid #dce6f6; border-radius: 16px; background: #fff; display: grid; place-items: center; text-align: center; padding: 40px 20px; box-shadow: 0 12px 28px rgba(20,40,80,.05); }
  .emptyIcon { width: 62px; height: 62px; border-radius: 18px; background: #eef4ff; color: #0048ff; display: grid; place-items: center; margin-bottom: 14px; }
  .emptyIcon .bidIcon { width: 28px; height: 28px; }
  .emptyBids h2 { margin: 0 0 8px; font-size: 24px; letter-spacing: -.65px; }
  .emptyBids p { margin: 0 auto; max-width: 540px; color: #5b6882; line-height: 1.55; font-weight: 700; }
  .emptyActions { margin-top: 20px; display: inline-flex; gap: 10px; }
  .emptyActions a { min-height: 42px; border-radius: 10px; border: 1px solid #dbe6f7; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; font-weight: 950; color: #0048ff; }
  .emptyActions a:last-child { background: #0048ff; color: #fff; border-color: #0048ff; }
  .bidSteps { margin-top: 14px; border: 1px solid #dce6f6; border-radius: 16px; background: white; min-height: 112px; display: grid; grid-template-columns: 1.05fr repeat(3, 1fr); gap: 0; box-shadow: 0 12px 30px rgba(20,40,80,.05); overflow: hidden; }
  .bidSteps > div, .bidSteps article { padding: 22px; }
  .bidSteps > div h2 { margin: 0 0 12px; font-size: 22px; line-height: 1.05; letter-spacing: -.55px; }
  .bidSteps > div p, .bidSteps article p { margin: 0; color: #52617c; line-height: 1.45; font-size: 13px; font-weight: 650; }
  .bidSteps article { display: grid; grid-template-columns: 46px 40px 1fr; gap: 14px; align-items: center; border-left: 1px solid #e2eaf7; }
  .bidSteps article > span { width: 46px; height: 46px; border-radius: 999px; border: 1px solid #cfe0ff; background: #eff5ff; display: grid; place-items: center; font-size: 22px; font-weight: 950; }
  .bidSteps article .bidIcon { width: 32px; height: 32px; color: #0b1533; }
  .bidSteps strong { display: block; margin-bottom: 5px; font-size: 14px; font-weight: 950; }
  @media (max-width: 1220px) { .bidsNav { display: none; } .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: min(100% - 40px, 1432px); } .heroCar { right: 0; width: 64%; } .bidSearch { right: 40px; grid-template-columns: repeat(2,1fr); position: relative; left: auto; right: auto; bottom: auto; margin-top: 26px; } .filterPills { position: relative; left: auto; bottom: auto; margin-top: 12px; } .bidsHero { min-height: auto; } .bidSearch button { grid-column: 1 / -1; } }
  @media (max-width: 860px) { .bidsTopbar { padding: 14px 18px; height: auto; } .bidsLogo { font-size: 34px; } .bidsActions a:not(.postButton) { display: none; } .bidsActions .postButton { display: none; } .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: calc(100% - 28px); } .bidsHero { margin-top: 10px; padding: 26px 22px 18px; border-radius: 18px; } .heroText { width: 100%; } .heroText h1 { font-size: 36px; } .heroCar { position: relative; display: block; top: auto; right: auto; width: 100%; height: 190px; margin: 12px 0 -8px; object-fit: cover; object-position: right center; } .bidSearch { grid-template-columns: 1fr; padding: 12px; } .resultsHeader { align-items: flex-start; } .bidSteps { grid-template-columns: 1fr; } .bidSteps article { border-left: none; border-top: 1px solid #e2eaf7; } }
`;
