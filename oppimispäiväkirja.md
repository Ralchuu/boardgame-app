# Oppimispäiväkirja

## Sovelluksen aihe ja kuvaus

Työn aiheena on **Steam Finder**, Expo- ja React Native -sovellus, jonka avulla käyttäjä voi hakea Steam-pelejä, selata pelien tietoja ja tallentaa suosikkeja. Sovelluksen ideana oli tehdä selkeä ja käytännöllinen mobiilisovellus, jossa on hakutoiminto, suosikkien hallinta, suositukset ja käyttäjäsisältöä tukeva profiilisivu.

### Käytetyt teknologiat ja kirjastot

- **Expo** ja **React Native** mobiilisovelluksen runkona
- **TypeScript** sovelluksen toteutuskielenä
- **Expo Router** näkymien ja navigaation hallintaan
- **Firebase Authentication** käyttäjien kirjautumiseen ja rekisteröitymiseen
- **Firebase Realtime Database** suosikkien tallentamiseen
- **Steam Store API** pelien hakemiseen ja pelitietojen näyttämiseen
- **AsyncStorage** käyttäjätunnuksen säilyttämiseen paikallisesti
- **react-native-safe-area-context** järjestelmäalueiden huomioimiseen
- **expo-haptics** ja muut Expo-kirjastot käyttökokemuksen parantamiseen

## Toteutuksen vaiheet

### 1. Aiheen valinta ja suunnittelu

Aluksi valittiin sovelluksen aihe niin, että se sopii mobiiliohjelmoinnin kurssin tavoitteisiin. Halusin tehdä sovelluksen, jossa on haku, lista, tallennus ja kirjautuminen, koska ne harjoittavat useita kurssilla opittuja osa-alueita.

Palautteen perusteella tavoitteeksi asetettiin tehdä sovelluksesta visuaalisesti siisti ja helposti esiteltävä, ei pelkkä tekninen demo.

### 2. Perustoiminnallisuuksien rakentaminen

Ensimmäisessä vaiheessa toteutin kirjautumisen, rekisteröitymisen, hakunäkymän, suosikit ja suositukset. Tämän jälkeen sovellukseen tuli toimiva rakenne, jossa käyttäjä voi etsiä pelejä, lisätä niitä suosikkeihin ja saada niiden perusteella suosituksia.

### 3. Käyttöliittymän yhtenäistäminen

Seuraavassa vaiheessa paransin sovelluksen ulkoasua, koska alussa eri näkymät näyttivät hieman erilaisilta ja osa sisällöstä käytti kovakoodattuja värejä. Ratkaisin tämän tekemällä yhteiset väriteemat ja pintavärit, joita käytettiin kaikissa näkymissä.

Tämä teki sovelluksesta selkeämmän ja ammattimaisemman näköisen.

### 4. Safe area -ongelmien korjaaminen

Android-laitteella osa sisällöstä meni järjestelmäalueiden, kuten kellon ja navigointipalkin, päälle. Tämä näkyi erityisesti tabien alareunassa ja hakusivun otsikossa.

Ratkaisuna lisäsin safe area -tuen tab-layoutiin ja yksittäisiin näkymiin. Sen jälkeen sisältö alkoi oikeasta kohdasta eikä mennyt puhelimen järjestelmäelementtien päälle.

### 5. Hakusivun visuaalinen viimeistely

Hakusivu tuntui aluksi hieman tyhjältä, joten lisäsin siihen teemaan sopivan hero-osion, pienen logo-/ikoni-elementin ja taustamuotoja. Tämä teki sivusta elävämmän ilman että se muuttui liian raskaaksi.

Samalla tulin siihen johtopäätökseen, että sovellukselle kannattaa tehdä oma logo. Yksinkertainen ja tunnistettava logo tukee koko sovelluksen ulkoasua ja auttaa myös app iconin ja splash screenin suunnittelussa.

## Kohdatut ongelmat ja ratkaisut

### Ongelma 1: Steam API ja web-käyttö

Steam-haku ei toiminut kaikissa ympäristöissä suoraan selaimessa CORS-rajoitusten takia.

**Ratkaisu:** Sovellukseen lisättiin paikallinen Steam-proxy-palvelin kehitystä varten. Sen avulla haku toimii luotettavammin webissä ja kehityksessä.

### Ongelma 2: Firebase-asetukset ja kirjautuminen

Firebaseen liittyvässä toteutuksessa tuli vastaan alkuvaiheessa useita asetuksiin liittyviä ongelmia. Kirjautuminen ja rekisteröityminen eivät toimineet heti odotetusti, koska Firebase-projekti, Authentication-asetukset ja Realtime Database -yhteys piti saada oikein kuntoon. Myös ympäristömuuttujien ja palvelun alustuksen kanssa piti olla tarkkana, jotta sovellus ei yrittänyt käyttää puuttuvia asetuksia.

**Ratkaisu:** Tarkistin Firebase-projektin asetukset, varmistin Authenticationin käyttöönoton ja testasin, että tietokantaan tallennus ja lukeminen toimivat oikein. Lisäksi tallensin käyttäjän tunnuksen paikallisesti AsyncStoragen avulla, jotta sovellus pystyy pitämään käyttäjän tilan hallinnassa uudelleenkäynnistyksen jälkeen.

### Ongelma 3: Yhtenäisen tyylin puute

Alussa eri näkymissä oli paljon kovakoodattuja värejä ja eri kokoisia kortteja, mikä sai sovelluksen näyttämään hajanaiselta.

**Ratkaisu:** Määrittelin yhteiset väri- ja pintatokenit ja käytin niitä kaikissa näkymissä. Tämän jälkeen käyttöliittymästä tuli yhtenäinen.

### Ongelma 4: Sisältö meni järjestelmäalueiden päälle

Androidilla tabien ikonit ja hakusivun otsikko olivat liian lähellä puhelimen ylä- ja alareunoja.

**Ratkaisu:** Käytin safe area -sisennyksiä sekä tabien layoutissa että näkymien sisällössä. Tämä korjasi sijoittelun ja teki sovelluksesta siistimmän käyttää.

### Ongelma 5: Hakusivu näytti tyhjältä

Hakusivun ensimmäinen versio oli toimiva mutta visuaalisesti vähän orpo.

**Ratkaisu:** Lisäsin etusivulle esittelyosion, ikonin ja taustamuotoja sekä harkitsin sovellukselle omaa logoa. Näin hakusivusta tuli selkeämpi ja paremmin viimeistelty.

## Yhteenveto

