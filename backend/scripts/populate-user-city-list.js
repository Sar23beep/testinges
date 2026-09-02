const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
const connectDatabase = require('../config/db');

// List of all 919 items provided by user
const rawList = require('./raw-cities.json');

// Helper to sanitize slug
function makeValidSlug(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics (ā -> a, ü -> u, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// State detection dictionary & heuristics
const stateHints = {
  // Rajasthan
  'rajasthan': 'Rajasthan', 'boya': 'Rajasthan', 'bundi': 'Rajasthan', 'butati': 'Rajasthan', 'bankli': 'Rajasthan',
  'chachaura': 'Madhya Pradesh', 'chaksu': 'Rajasthan', 'chamboa sarjela': 'Rajasthan', 'chandan': 'Rajasthan',
  'chandelao': 'Rajasthan', 'chandrawati': 'Rajasthan', 'chauhtan': 'Rajasthan', 'chhabra': 'Rajasthan',
  'chhata': 'Uttar Pradesh', 'chhipa barod': 'Rajasthan', 'chhoti sadri': 'Rajasthan', 'chikalwas': 'Rajasthan',
  'chirawa': 'Rajasthan', 'chittorgarh': 'Rajasthan', 'chomu': 'Rajasthan', 'dhariyawad': 'Rajasthan',
  'dhaulpur': 'Rajasthan', 'dheerpura': 'Rajasthan', 'dholpur': 'Rajasthan', 'dhand': 'Haryana', 'dhānd': 'Haryana',
  'didwana': 'Rajasthan', 'digod': 'Rajasthan', 'doodni': 'Rajasthan', 'dudu': 'Rajasthan',
  'dungargarh': 'Rajasthan', 'dungarpur': 'Rajasthan', 'eklingji': 'Rajasthan', 'elaka': 'Rajasthan',
  'falna': 'Rajasthan', 'fatehabad': 'Haryana', 'fatehpur': 'Rajasthan', 'fazilka': 'Punjab',
  'ferozpur jhirka': 'Haryana', 'gajner': 'Rajasthan', 'gangapur': 'Rajasthan', 'gangaput': 'Rajasthan',
  'gangdhar': 'Rajasthan', 'gangrar': 'Rajasthan', 'ganganagar': 'Rajasthan', 'garhi': 'Rajasthan',
  'garot': 'Madhya Pradesh', 'ghanerao': 'Rajasthan', 'ghatol': 'Rajasthan', 'goga medi': 'Rajasthan',
  'gogunda': 'Rajasthan', 'gosunda': 'Rajasthan', 'gudha gorji': 'Rajasthan', 'gulabpura': 'Rajasthan',
  'guman': 'Rajasthan', 'guna': 'Madhya Pradesh', 'giigarh': 'Rajasthan', 'gudha': 'Rajasthan', 'güdha': 'Rajasthan',
  'hanumangarh': 'Rajasthan', 'hindaun': 'Rajasthan', 'hindoli': 'Rajasthan', 'hisar': 'Haryana',
  'honkra': 'Rajasthan', 'jahazpur': 'Rajasthan', 'jaipur': 'Rajasthan', 'jaipur district': 'Rajasthan',
  'jairampura': 'Rajasthan', 'jaisalmer': 'Rajasthan', 'jaisamand': 'Rajasthan', 'jaitaran': 'Rajasthan',
  'jalor': 'Rajasthan', 'jamool khera': 'Rajasthan', 'jamwa ramgarh': 'Rajasthan', 'jawad': 'Madhya Pradesh',
  'jawai bandh': 'Rajasthan', 'jayal': 'Rajasthan', 'jhalamand': 'Rajasthan', 'jhalarapatan': 'Rajasthan',
  'jhalawar': 'Rajasthan', 'jhalod': 'Gujarat', 'jharol': 'Rajasthan', 'jhunjhunu': 'Rajasthan',
  'jirapur': 'Madhya Pradesh', 'jodhpur': 'Rajasthan', 'jojawar': 'Rajasthan', 'jora': 'Madhya Pradesh',
  'juliasar': 'Rajasthan', 'kalakho': 'Rajasthan', 'kalinjara': 'Rajasthan', 'kalwad kalan and khurd': 'Rajasthan',
  'kaman': 'Rajasthan', 'kanooja': 'Rajasthan', 'kapasan': 'Rajasthan', 'karanpur': 'Rajasthan',
  'karauli': 'Rajasthan', 'karlai': 'Rajasthan', 'karnu': 'Rajasthan', 'kekri': 'Rajasthan',
  'keshorai patan': 'Rajasthan', 'ketu barabas': 'Rajasthan', 'khairagarh': 'Uttar Pradesh',
  'khandar': 'Rajasthan', 'khandela': 'Rajasthan', 'khandi': 'Rajasthan', 'khanjipeer': 'Rajasthan',
  'khanpur': 'Rajasthan', 'kharda': 'Rajasthan', 'khatoo': 'Rajasthan', 'khed brahma': 'Gujarat',
  'khejarla': 'Rajasthan', 'kherli kalan': 'Rajasthan', 'kherwara': 'Rajasthan', 'khetri': 'Rajasthan',
  'khichan': 'Rajasthan', 'khilchipur': 'Madhya Pradesh', 'khimsar': 'Rajasthan', 'khiyansaria': 'Rajasthan',
  'khonda': 'Rajasthan', 'khuri': 'Rajasthan', 'kiraoli': 'Uttar Pradesh', 'kishanganj': 'Bihar',
  'kishanaarh': 'Rajasthan', 'kishangarh': 'Rajasthan', 'kishangarh bas': 'Rajasthan', 'kivarli': 'Rajasthan',
  'kolaras': 'Madhya Pradesh', 'kolayat': 'Rajasthan', 'kolu': 'Rajasthan', 'kookas': 'Rajasthan',
  'kota': 'Rajasthan', 'kotputli': 'Rajasthan', 'kotra': 'Rajasthan', 'kotri': 'Rajasthan',
  'kuchaman': 'Rajasthan', 'kuldhar': 'Rajasthan', 'kumbhalgarh': 'Rajasthan', 'kumher': 'Rajasthan',
  'kalwara': 'Rajasthan', 'kanota': 'Rajasthan', 'lachhmangarh': 'Rajasthan', 'lakhau': 'Rajasthan',
  'lakawas': 'Rajasthan', 'lakawās': 'Rajasthan', 'lalsot': 'Rajasthan', 'lasadia': 'Rajasthan',
  'loharu': 'Haryana', 'lunda': 'Rajasthan', 'luni': 'Rajasthan', 'lunkaransar': 'Rajasthan',
  'mahamandir': 'Rajasthan', 'mahansar': 'Rajasthan', 'mahendragarh': 'Haryana', 'mahwah': 'Rajasthan',
  'malhargarh': 'Madhya Pradesh', 'malpura': 'Rajasthan', 'manasa': 'Madhya Pradesh',
  'mandai charnan': 'Rajasthan', 'mandal': 'Rajasthan', 'mandalgarh': 'Rajasthan', 'mandawa': 'Rajasthan',
  'mandawar': 'Rajasthan', 'mandore': 'Rajasthan', 'mandsaur': 'Madhya Pradesh', 'mangalwad': 'Rajasthan',
  'mangrol': 'Rajasthan', 'mathura': 'Uttar Pradesh', 'meghraj': 'Gujarat', 'mehandipur': 'Rajasthan',
  'menal': 'Rajasthan', 'merta': 'Rajasthan', 'mogana': 'Rajasthan', 'mogra': 'Rajasthan',
  'morena': 'Madhya Pradesh', 'mount abu': 'Rajasthan', 'mavli': 'Rajasthan', 'mãvli': 'Rajasthan',
  'nadbai': 'Rajasthan', 'naenwa': 'Rajasthan', 'nagar': 'Rajasthan', 'nagaur': 'Rajasthan',
  'nakoda': 'Rajasthan', 'nandauti': 'Rajasthan', 'naorangdesar': 'Rajasthan', 'narlai': 'Rajasthan',
  'narnaul': 'Haryana', 'nasirabad': 'Rajasthan', 'nathdwara': 'Rajasthan', 'nathrau': 'Rajasthan',
  'nawa': 'Rajasthan', 'nawalgarh': 'Rajasthan', 'neem ka thana': 'Rajasthan', 'neemrana': 'Rajasthan',
  'neemuch': 'Madhya Pradesh', 'nimaaj': 'Rajasthan', 'nimbahera': 'Rajasthan', 'niwai': 'Rajasthan',
  'nohar': 'Rajasthan', 'nokha': 'Rajasthan', 'nuh': 'Haryana', 'nai': 'Rajasthan', 'nimri': 'Rajasthan',
  'ordi': 'Rajasthan', 'osian': 'Rajasthan', 'pachpadra': 'Rajasthan', 'pachpahar': 'Rajasthan',
  'padampur': 'Rajasthan', 'pal': 'Rajasthan', 'pali': 'Rajasthan', 'pallu': 'Rajasthan',
  'paota': 'Rajasthan', 'parsoli': 'Rajasthan', 'parvatsar': 'Rajasthan', 'peharsar': 'Rajasthan',
  'perwa': 'Rajasthan', 'phagi': 'Rajasthan', 'phalodi': 'Rajasthan', 'phalsiya': 'Rajasthan',
  'phulera': 'Rajasthan', 'pichiyak': 'Rajasthan', 'pilani': 'Rajasthan', 'pilibangan': 'Rajasthan',
  'pindwara': 'Rajasthan', 'pipalda kalan': 'Rajasthan', 'pirawa': 'Rajasthan', 'pohri': 'Madhya Pradesh',
  'pokhran': 'Rajasthan', 'poshina': 'Gujarat', 'pratapgarh': 'Rajasthan', 'prempura': 'Rajasthan',
  'punawali': 'Rajasthan', 'pushkar': 'Rajasthan', 'pakhar': 'Rajasthan', 'raghogarh': 'Madhya Pradesh',
  'raisinghnagar': 'Rajasthan', 'rajawas': 'Rajasthan', 'rajgarh': 'Rajasthan', 'rughnathpura': 'Rajasthan',
  'rupbas': 'Rajasthan', 'rama': 'Rajasthan', 'rupnagar': 'Rajasthan', 'rüpnagar': 'Rajasthan',
  'sabalgarh': 'Madhya Pradesh', 'sadri': 'Rajasthan', 'sadulshahr': 'Rajasthan', 'sagwara': 'Rajasthan',
  'sailana': 'Madhya Pradesh', 'saira': 'Rajasthan', 'sakrai': 'Rajasthan', 'salawas': 'Rajasthan',
  'salumbar': 'Rajasthan', 'sam': 'Rajasthan', 'sambhar': 'Rajasthan', 'sanchor': 'Rajasthan',
  'sangariya': 'Rajasthan', 'sangod': 'Rajasthan', 'sanjharia': 'Rajasthan', 'sarada': 'Rajasthan',
  'sardar samano': 'Rajasthan', 'sardarshahar': 'Rajasthan', 'sarwan': 'Rajasthan', 'sarwar': 'Rajasthan',
  'sawai madhopur': 'Rajasthan', 'sena': 'Rajasthan', 'seruna': 'Rajasthan', 'shahbad': 'Rajasthan',
  'shahjahanpur': 'Rajasthan', 'shahpura': 'Rajasthan', 'shaitrawa': 'Rajasthan', 'shavri colony': 'Rajasthan',
  'shekhala': 'Rajasthan', 'sheopur': 'Madhya Pradesh', 'shergarh': 'Rajasthan', 'shiv': 'Rajasthan',
  'shivganj': 'Rajasthan', 'sindhari': 'Rajasthan', 'sirohi': 'Rajasthan', 'sitamau': 'Madhya Pradesh',
  'siwana': 'Rajasthan', 'siwani': 'Haryana', 'sodakore': 'Rajasthan', 'sodala': 'Rajasthan',
  'sojat': 'Rajasthan', 'subhash nagar': 'Delhi', 'sujangarh': 'Rajasthan', 'sumerpur': 'Rajasthan',
  'sundhamata': 'Rajasthan', 'susner': 'Madhya Pradesh', 'suratgarh': 'Rajasthan', 'talab': 'Rajasthan',
  'taleti': 'Rajasthan', 'taoru': 'Haryana', 'tapukara': 'Rajasthan', 'thadiya': 'Rajasthan',
  'thanagazi': 'Rajasthan', 'thandla': 'Madhya Pradesh', 'tharad': 'Gujarat', 'tibi': 'Rajasthan',
  'tijara': 'Rajasthan', 'toda bhim': 'Rajasthan', 'toda raisingh': 'Rajasthan', 'todgarh': 'Rajasthan',
  'tonk': 'Rajasthan', 'tonk phatak': 'Rajasthan', 'tordi': 'Rajasthan', 'tirath': 'Rajasthan',
  'udaipurwati': 'Rajasthan', 'uniara': 'Rajasthan', 'vallabhnagar': 'Rajasthan', 'vav': 'Gujarat',
  'vijayanagar': 'Rajasthan', 'viratnagar': 'Rajasthan', 'virpur': 'Gujarat', 'aauwa': 'Rajasthan',
  'abhaneri': 'Rajasthan', 'abohar': 'Punjab', 'abu road': 'Rajasthan', 'achal gadh': 'Rajasthan',
  'achrol': 'Rajasthan', 'ahor': 'Rajasthan', 'air force area': 'Rajasthan', 'ajit colony': 'Rajasthan',
  'ajmer': 'Rajasthan', 'aklera': 'Rajasthan', 'alot': 'Madhya Pradesh', 'alsisar': 'Rajasthan',
  'alwar': 'Rajasthan', 'amar sagar pol': 'Rajasthan', 'ambah': 'Madhya Pradesh', 'amer': 'Rajasthan',
  'amet': 'Rajasthan', 'ani': 'Himachal Pradesh', 'anjna': 'Rajasthan', 'anupgarh': 'Rajasthan',
  'arnaud': 'Rajasthan', 'asind': 'Rajasthan', 'aspur': 'Rajasthan', 'atru': 'Rajasthan',
  'bagar': 'Rajasthan', 'bagar meo': 'Rajasthan', 'bagidora': 'Rajasthan', 'bagru': 'Rajasthan',
  'bah': 'Uttar Pradesh', 'balesar': 'Rajasthan', 'bali': 'Rajasthan', 'balotra': 'Rajasthan',
  'bamanwas': 'Rajasthan', 'bamora': 'Rajasthan', 'banar': 'Rajasthan', 'bandikui': 'Rajasthan',
  'banera': 'Rajasthan', 'bansur': 'Rajasthan', 'banswara': 'Rajasthan', 'bap': 'Rajasthan',
  'baran': 'Rajasthan', 'rarar': 'Rajasthan', 'bari sadri': 'Rajasthan', 'barmer': 'Rajasthan',
  'baseri': 'Rajasthan', 'bassi': 'Rajasthan', 'baswa': 'Rajasthan', 'bawal': 'Haryana',
  'bayana': 'Rajasthan', 'begun': 'Rajasthan', 'behror': 'Rajasthan', 'bera': 'Rajasthan',
  'beawar': 'Rajasthan', 'bhachau': 'Gujarat', 'bhadesar': 'Rajasthan', 'bhadra': 'Rajasthan',
  'bhagat ki kothi': 'Rajasthan', 'bhangarh': 'Rajasthan', 'bhanpura': 'Madhya Pradesh',
  'bharatpur': 'Rajasthan', 'bhehna': 'Rajasthan', 'bhiloda': 'Gujarat', 'bhilwara': 'Rajasthan',
  'bhim': 'Rajasthan', 'bhinai': 'Rajasthan', 'bhinmal': 'Rajasthan', 'bhiwadi': 'Rajasthan',
  'bhopalgarh': 'Rajasthan', 'bhindar': 'Rajasthan', 'bijaipur': 'Rajasthan', 'bijapur': 'Karnataka',
  'bijaynagar': 'Rajasthan', 'bijolia': 'Rajasthan', 'bikaner': 'Rajasthan', 'bilara': 'Rajasthan',
  'bilonchi': 'Rajasthan', 'bilona': 'Rajasthan', 'bilonā': 'Rajasthan', 'binawas': 'Rajasthan',
  'bisalpur': 'Rajasthan', 'bishangarh': 'Rajasthan', 'bonali': 'Rajasthan',

  // Hyderabad / Telangana areas
  'film nagar': 'Telangana', 'upparpally': 'Telangana', 'chevalla': 'Telangana', 'gandipet': 'Telangana',
  'bhuvanagiri': 'Telangana', 'raikal': 'Telangana', 'patancheru-shankarpalli road': 'Telangana',
  'manneguda': 'Telangana', 'bn reddy nagar': 'Telangana', 'gudimalkapur': 'Telangana',
  'domalauda': 'Telangana', 'hastinapuram': 'Telangana', 'keesara': 'Telangana', 'mehadipatnam': 'Telangana',
  'sitaphalmandi': 'Telangana', 'nadergul': 'Telangana', 'bhoiguda': 'Telangana', 'gagillapur': 'Telangana',
  'prashanth nagar': 'Telangana', 'gunrock enclave': 'Telangana', 'new mallepally': 'Telangana',
  'new malakpet': 'Telangana', 'raj bhavan road': 'Telangana', 'chintalkunta': 'Telangana',
  'surya nagar colony': 'Telangana', 'jalpally': 'Telangana', 'chowdhariguda': 'Telangana',
  'moghalpura': 'Telangana', 'dullapally': 'Telangana', 'kakaguda': 'Telangana', 'riyasat nagar': 'Telangana',
  'jawahar nagar': 'Telangana', 'lallaguda': 'Telangana', 'saifabad': 'Telangana', 'vattepally': 'Telangana',
  'jam bagh': 'Telangana', 'adarsh nagar': 'Delhi', 'majarguda': 'Telangana', 'bairagiguda': 'Telangana',
  'rasoolpura': 'Telangana', 'siddhartha nagar': 'Telangana', 'kazipally': 'Telangana',
  'ravulapalle khurd': 'Telangana', 'seetharampally': 'Telangana', 'gundlapochampally': 'Telangana',
  'erragadda': 'Telangana', 'thimmapur': 'Telangana', 'golkonda': 'Telangana', 'adikmet': 'Telangana',
  'falaknuma': 'Telangana', 'katedan': 'Telangana', 'ramgopalpet': 'Telangana', 'nh-7': 'Telangana',
  'nagarjuna sagar road': 'Telangana', 'narsapur': 'Telangana', 'abdullapurmet': 'Telangana',
  'neeladri nagar': 'Telangana', 'pahadi shareef': 'Telangana', 'karwan': 'Telangana',
  'walker town': 'Telangana', 'vayupuri': 'Telangana', 'narketpalli': 'Telangana', 'zahirabad': 'Telangana',
  'pulimamidi': 'Telangana', 'dayara': 'Telangana', 'gulshan-e-lgbal colony': 'Telangana',
  'dhoolpet': 'Telangana', 'chintapallyguda': 'Telangana', 'dasarlapally': 'Telangana',
  'edulanagulapalle': 'Telangana', 'moti ganpur': 'Telangana', 'tulekhurd': 'Telangana',
  'bogaram': 'Telangana', 'nampally': 'Telangana', 'kowkur': 'Telangana', 'isnapur': 'Telangana',
  'lalapet': 'Telangana', 'sangareddy': 'Telangana', 'bandlaguda - nagole': 'Telangana',
  'mansoorabad': 'Telangana', 'maruti nagar': 'Telangana', 'patighanpur': 'Telangana',
  'santosh nagar': 'Telangana', 'pet basheerabad': 'Telangana', 'chandrayanagutta': 'Telangana',
  'moosarambagh': 'Telangana', 'suraram': 'Telangana', 'peerancheru': 'Telangana', 'ram nagar': 'Telangana',
  'muthangi': 'Telangana', 'budvel': 'Telangana', 'nh-9 highway': 'Telangana', 'bahadurpura': 'Telangana',
  'humayun nagar': 'Telangana', 'mylargada': 'Telangana', 'saleem nagar': 'Telangana',
  'kandukur': 'Telangana', 'almasguda': 'Telangana', 'narayanguda': 'Telangana', 'ramoji film city': 'Telangana',
  'champapet': 'Telangana', 'karkhana': 'Telangana', 'shamshabad road': 'Telangana', 'rai durg': 'Telangana',
  'rajeev nagar': 'Telangana', 'koti': 'Telangana', 'qutub shahi tombs': 'Telangana',
  'sivarampalli': 'Telangana', 'pochampally': 'Telangana', 'venkatapuram': 'Telangana',
  'outer ring road': 'Telangana', 'r.k.puram': 'Delhi', 'kalasiguda': 'Telangana', 'hakimpet': 'Telangana',
  'lothkunta': 'Telangana', 'kanchan bagh': 'Telangana', 'indresham': 'Telangana',
  'konaara kalan': 'Telangana', 'yakhutpura': 'Telangana', 'nawab saheb kunta': 'Telangana',
  'lumbini park': 'Telangana', 'osman sagar road': 'Telangana', 'sultanpur': 'Uttar Pradesh',
  'medak road': 'Telangana', 'rendlagadda': 'Telangana', 'tupran': 'Telangana', 'ntr nagar': 'Telangana',
  'jeera': 'Telangana', 'sindhi colony': 'Telangana', 'afzal gunj': 'Telangana', 'mirkhanpet': 'Telangana',
  'kurmaguda': 'Telangana', 's d road': 'Telangana', 'uppaguda': 'Telangana', 'pavanpuri colony': 'Telangana',
  'burgul': 'Telangana', 'mazidpur': 'Telangana', 'hanuman nagar colony': 'Telangana',
  'sheriguda': 'Telangana', 'lal darwaza': 'Telangana', 'ghansi bazar': 'Telangana',
  'venkat reddy colony': 'Telangana', 'shameerpet': 'Telangana', 'rani gunj': 'Telangana',
  'maisireddipalle': 'Telangana', 'gachibowli': 'Telangana', 'manikonda': 'Telangana',
  'madinaguda': 'Telangana', 'nizampet': 'Telangana', 'bachupally': 'Telangana',
  'gajularamaram': 'Telangana', 'puppalaguda': 'Telangana', 'ameerpet': 'Telangana',
  'bandlaaude': 'Telangana', 'shamshabad': 'Telangana', 'srisailam highway': 'Telangana',
  'sainikpur': 'Telangana', 'bhanur': 'Telangana', 'himayath nagar': 'Telangana',
  'lingampally': 'Telangana', 'rajendra nagar': 'Telangana', 'mehdipatnam': 'Telangana',
  'bolaram': 'Telangana', 'nanakramguda': 'Telangana', 'kothaguda': 'Telangana',
  'tarnaka': 'Telangana', 'kapre': 'Telangana', 'suchitra road': 'Telangana', 'kondapur': 'Telangana',
  'hi tech city': 'Telangana', 'narsingi': 'Telangana', 'banjara hills': 'Telangana',
  'kompally': 'Telangana', 'hafeezpet': 'Telangana', 'shadnagar': 'Telangana', 'alwal': 'Telangana',
  'tellapur': 'Telangana', 'dilsukhnaga': 'Telangana', 'yapral': 'Telangana', 'nagole': 'Telangana',
  'dammaiguda': 'Telangana', 'vanasthalipuram': 'Telangana', 'nizampet road': 'Telangana',
  'financial district': 'Telangana', 'shamirpet': 'Telangana', 'chintal': 'Telangana',
  'kothapet': 'Telangana', 'mallapur': 'Telangana', 'tukkuguda': 'Telangana', 'kismatpur': 'Telangana',
  'kavadiguda': 'Telangana', 'osman nagar': 'Telangana', 'old bowenpally': 'Telangana',
  'sanjeeva reddy nagar': 'Telangana', 'mallampet': 'Telangana', 'warangal highway': 'Telangana',
  'saroor naga': 'Telangana', 'shankarpalli': 'Telangana', 'sri nagar colony': 'Telangana',
  'hyder nagar': 'Telangana', 'malakpet': 'Telangana', 'bala nagar': 'Telangana', 'mettuguda': 'Telangana',
  'srinagar colony': 'Telangana', 'langar houz': 'Telangana', 'kavuri hils': 'Telangana',
  'medipalli': 'Telangana', 'quthbullapur': 'Telangana', 'badangpet': 'Telangana',
  'ramchandra puram': 'Telangana', 'cherlapally': 'Telangana', 'anandbagh': 'Telangana',
  'velimela': 'Telangana', 'musheerabad': 'Telangana', 'gurram guda': 'Telangana',
  'karmanghat': 'Telangana', 'east marredpally': 'Telangana', 'bhongir': 'Telangana',
  'shanthi nagar': 'Telangana', 'masab tank': 'Telangana', 'saidabad': 'Telangana',
  'gandhi naga': 'Telangana', 'turkayamjal': 'Telangana', 'jeedimetla': 'Telangana',
  'balapur': 'Telangana', 'vijayawada highway': 'Telangana', 'yousufguda': 'Telangana',

  // Delhi & NCR areas
  'ashram': 'Delhi', 'keshavpuran': 'Delhi', 'naraina': 'Delhi', 'sarai rohilla': 'Delhi',
  'wazirabad': 'Delhi', 'maharani bagh': 'Delhi', 'rohini sector 17': 'Delhi', 'vaishali': 'Uttar Pradesh',
  'delhi cantonment': 'Delhi', 'raja garden': 'Delhi', 'matiala': 'Delhi', 'civil lines': 'Delhi',
  'golf links': 'Delhi', 'pushp vihar': 'Delhi', 'kalindi kunj': 'Delhi', 'budh vihar': 'Delhi',
  'ghazipur': 'Uttar Pradesh', 'rohini sector 23': 'Delhi', 'tri nagar': 'Delhi', 'loknayakpuram': 'Delhi',
  'greater kailash iii': 'Delhi', 'mithapur': 'Delhi', 'azadpur': 'Delhi', 'govindpuri extension': 'Delhi',
  'dera mandi': 'Delhi', 'gulabi bagh': 'Delhi', 'kashmiri gate': 'Delhi', 'khan market': 'Delhi',
  'dwarka sector 21': 'Delhi', 'cr park': 'Delhi', 'nehru place': 'Delhi', 'pahar ganj': 'Delhi',
  'vivek vihar': 'Delhi', 'yusuf sarai': 'Delhi', 'lawrence road': 'Delhi', 'ber saral': 'Delhi',
  'gandhi nagar': 'Delhi', 'rohini sector 1': 'Delhi', 'vijay vihar': 'Delhi', 'barakhamba road': 'Delhi',
  'mundka': 'Delhi', 'roop nagar': 'Delhi', 'ajmeri gate': 'Delhi', 'khajoori khas': 'Delhi',
  'sukhdev vihar': 'Delhi', 'balbir nagar': 'Delhi', 'bharat nagar': 'Delhi', 'vigyan vihar': 'Delhi',
  'siraspur': 'Delhi', 'chanakyapuri': 'Delhi', 'katwaria saral': 'Delhi', 'rithala': 'Delhi',
  'seemapuri': 'Delhi', 'akshar dham': 'Delhi', 'sundar nagar': 'Delhi', 'prem nagar': 'Delhi',
  'chawri bazar': 'Delhi', 'sarojini nagar': 'Delhi', 'razapur khurd': 'Delhi', 'alipur': 'Delhi',
  'madanpur khadar': 'Delhi', 'tis hazari': 'Delhi', 'pul prahladpur': 'Delhi', 'inderpuri': 'Delhi',
  'kanjhawala': 'Delhi', 'rohini sector-36': 'Delhi', 'fatehpur beri': 'Delhi', 'lal kuan': 'Delhi',
  'rohini sector 19': 'Delhi', 'yojana vihar': 'Delhi', 'bhagwan das road': 'Delhi', 'timarpur': 'Delhi',
  'bakhtawarpur': 'Delhi', 'daryaganj': 'Delhi', 'sonia vihar': 'Delhi', 'qutub vihar': 'Delhi',
  'nizamuddin': 'Delhi', 'rk puram': 'Delhi', 'dwarka sector 16 b': 'Delhi', 'bakkar wala': 'Delhi',
  'satbari': 'Delhi', 'bhajanpura': 'Delhi', 'safdarjung development area': 'Delhi', 'jahangir puri': 'Delhi',
  'mandi house': 'Delhi', 'rohini sector 20': 'Delhi', 'dashrath puri': 'Delhi', 'mukundpur': 'Delhi',
  'gujranwala town': 'Delhi', 'rohini east': 'Delhi', 'karala': 'Delhi', 'kapashera': 'Delhi',
  'bindapur': 'Delhi', 'ranjeet nagar': 'Delhi', 'johripur': 'Delhi', 'shastri park': 'Delhi',
  'chokhandi': 'Delhi', 'green park extension': 'Delhi', 'trilokpuri': 'Delhi', 'siri fort': 'Delhi',
  'bawana': 'Delhi', 'jor bagh': 'Delhi', 'pira garhi': 'Delhi', 'rohini sector 30': 'Delhi',
  'rohini sector 27': 'Delhi', 'jhilmil colony': 'Delhi', 'nilothi': 'Delhi', 'rangpuri': 'Delhi',
  'ranaji enclave': 'Delhi', 'azad nagar': 'Delhi', 'begumpur': 'Delhi', 'connaught place': 'Delhi',
  'gokalpur': 'Delhi', 'inderlok': 'Delhi', 'karawal nagar': 'Delhi', 'manglapuri': 'Delhi',
  'pragati maidan': 'Delhi', 'rohini sector 25': 'Delhi', 'sarai kale khan': 'Delhi', 'scami nagar': 'Delhi',
  'vrindavan': 'Uttar Pradesh', 'wazirpur': 'Delhi', 'sidhartha nagar': 'Delhi', 'hastsal': 'Delhi',
  'sri niwaspuri': 'Delhi', 'jaitpur': 'Delhi', 'deenpur': 'Delhi', 'sector 90': 'Delhi',
  'khera kalan': 'Delhi', 'kair': 'Delhi', 'shanti niketan': 'Delhi', 'anand parbat': 'Delhi',
  'asian games village complex': 'Delhi', 'badli': 'Delhi', 'bapa nagar': 'Delhi', 'aiims': 'Delhi',
  'babarpur': 'Delhi', 'bhikaji cama place': 'Delhi', 'dhaula kuan': 'Delhi', 'gol market': 'Delhi',
  'surajkund': 'Haryana', 'khureji': 'Delhi', 'mangolpuri': 'Delhi', 'rohini extension': 'Delhi',
  'rohini sector 32': 'Delhi', 'sunder nagari': 'Delhi', 'sultanpuri': 'Delhi', 'vikas kunj': 'Delhi',
  'brahmpuri': 'Delhi', 'dwarka sector 20': 'Delhi', 'inder enclave': 'Delhi', 'indraprastha estate': 'Delhi',
  'lakshmi bai nagar': 'Delhi', 'mayapuri': 'Delhi', 'rohini sector 10': 'Delhi', 'sadar bazar': 'Delhi',
  'savita vihar': 'Delhi', 'sector 45': 'Haryana', 'chaman vihar': 'Delhi', 'dwarka sector 27': 'Delhi',
  'nh8, gurgaon': 'Haryana', 'lodi colony': 'Delhi', 'navjeevan vihar': 'Delhi', 'rohini sector 12': 'Delhi',
  'sadiq nagar': 'Delhi', 'meerut': 'Uttar Pradesh', 'tilak marg': 'Delhi', 'jharoda majra burari': 'Delhi',
  'harsh vihar': 'Delhi', 'dwarka sector 16 a': 'Delhi', 'mustafabad': 'Delhi', 'moradabad': 'Uttar Pradesh',
  'seelampur': 'Delhi', 'batla house': 'Delhi', 'chhawla': 'Delhi', 'haibutpur': 'Delhi',
  'malka ganj': 'Delhi', 'tilangpur kotla': 'Delhi', 'bhalswa': 'Delhi', 'kidwal nagar': 'Delhi',
  'adchini': 'Delhi', 'bahapur': 'Delhi', 'sector 9a': 'Haryana', 'sector 91': 'Haryana',
  'rohini west': 'Delhi', 'sohna': 'Haryana', 'sector 150': 'Uttar Pradesh', 'sector 49, faridabad': 'Haryana',
  'sunlight colony': 'Delhi', 'kalu sarai': 'Delhi', 'goyla village': 'Delhi', 'dakshinpuri': 'Delhi',
  'shakurpur': 'Delhi', 'rohini sector-37': 'Delhi', 'daya basti': 'Delhi', 'gopalpur village': 'Delhi',
  'singhu': 'Delhi', 'ranhola': 'Delhi', 'rohini sector 38': 'Delhi', 'sawda': 'Delhi',
  'zone p ii': 'Delhi', 'village mandoli': 'Delhi', 'neeti bagh': 'Delhi', 'hauz khas enclave': 'Delhi',
  'uday park': 'Delhi', 'kaka nagar': 'Delhi', 'central delhi': 'Delhi', 'east delhi': 'Delhi',
  'north delhi': 'Delhi', 'north east delhi': 'Delhi', 'north west delhi': 'Delhi', 'south delhi': 'Delhi',
  'west delhi': 'Delhi', 'south west delhi': 'Delhi', 'ber sarai': 'Delhi',

  // Major cities
  'thiruvananthapuram': 'Kerala', 'thoothukudi': 'Tamil Nadu', 'tiruchirappalli': 'Tamil Nadu',
  'tirupati': 'Andhra Pradesh', 'tumkur': 'Karnataka', 'udaipur': 'Rajasthan', 'varanasi': 'Uttar Pradesh',
  'vadodara': 'Gujarat', 'vijayawada': 'Andhra Pradesh', 'visakhapatnam': 'Andhra Pradesh',
  'saket': 'Delhi', 'salem': 'Tamil Nadu', 'shimla': 'Himachal Pradesh', 'shirdi': 'Maharashtra',
  'siliguri': 'West Bengal', 'sonipat': 'Haryana', 'surat': 'Gujarat', 'thane': 'Maharashtra',
  'panchkula': 'Haryana', 'patiala': 'Punjab', 'patna': 'Bihar', 'prayagraj': 'Uttar Pradesh',
  'puducherry': 'Puducherry', 'pune': 'Maharashtra', 'puri': 'Odisha', 'raipur': 'Chhattisgarh',
  'rajouri garden': 'Delhi', 'rajahmundry': 'Andhra Pradesh', 'rajkot': 'Gujarat', 'ranchi': 'Jharkhand',
  'rishikesh': 'Uttarakhand', 'agra': 'Uttar Pradesh', 'ahmedabad': 'Gujarat', 'ahmednagar': 'Maharashtra',
  'aerocity': 'Delhi', 'alappuzha': 'Kerala', 'aligarh': 'Uttar Pradesh', 'ambala': 'Haryana',
  'amritsar': 'Punjab', 'andheri': 'Maharashtra', 'asansol': 'West Bengal', 'danaalore': 'Karnataka',
  'chikkamagaluru': 'Karnataka', 'coimbatore': 'Tamil Nadu', 'cuttack': 'Odisha', 'daman': 'Daman and Diu',
  'darjeeling': 'West Bengal', 'dehradun': 'Uttarakhand', 'delhi': 'Delhi', 'dharamshala': 'Himachal Pradesh',
  'erode': 'Tamil Nadu', 'faridabad': 'Haryana', 'gandhinagar': 'Gujarat', 'ghaziabad': 'Uttar Pradesh',
  'goa': 'Goa', 'jabalpur': 'Madhya Pradesh', 'jalandhar': 'Punjab', 'jammu': 'Jammu and Kashmir',
  'kanpur': 'Uttar Pradesh', 'karol bagh': 'Delhi', 'karnal': 'Haryana', 'kashipur': 'Uttarakhand',
  'kashmir': 'Jammu and Kashmir', 'kochi': 'Kerala', 'kolkata': 'West Bengal', 'ladakh': 'Ladakh',
  'lakshadweep': 'Lakshadweep', 'lucknow': 'Uttar Pradesh', 'ludhiana': 'Punjab', 'madurai': 'Tamil Nadu',
  'manali': 'Himachal Pradesh', 'mangalore': 'Karnataka', 'mira road': 'Maharashtra',
  'modinagar': 'Uttar Pradesh', 'mohali': 'Punjab', 'mussoorie': 'Uttarakhand', 'mysore': 'Karnataka',
  'nainital': 'Uttarakhand', 'nagpur': 'Maharashtra', 'nashik': 'Maharashtra', 'navi mumbai': 'Maharashtra',
  'noida': 'Uttar Pradesh', 'nizamabad': 'Telangana', 'ooty': 'Tamil Nadu', 'paharganj': 'Delhi',
  'panipat': 'Haryana'
};

async function main() {
  await connectDatabase();

  const srcDir = path.join(__dirname, '../../images');
  const targetDir = path.join(__dirname, '../public/images/profiles');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const srcFiles = fs.readdirSync(srcDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`Found ${srcFiles.length} source images in images/ directory.`);

  const copiedImageNames = [];
  srcFiles.forEach((file, index) => {
    const ext = path.extname(file) || '.jpeg';
    const destName = `profile-photo-${index + 1}${ext}`;
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(targetDir, destName);
    fs.copyFileSync(srcPath, destPath);
    copiedImageNames.push(destName);
  });
  console.log(`✓ Copied ${copiedImageNames.length} photos to public/images/profiles/`);

  // Ensure standard categories exist
  const categoryDefs = [
    { name: 'Independent', slug: 'independent', description: 'Independent verified profiles managing direct conversations.' },
    { name: 'Elite', slug: 'elite', description: 'A premium collection of high-class verified profiles.' },
    { name: 'Companion', slug: 'companion', description: 'Charming and social companion profiles.' },
    { name: 'VIP', slug: 'vip', description: 'Exclusive VIP profiles with verified luxury standards.' },
    { name: 'High Profile', slug: 'high-profile', description: 'Top-tier high profile verified listings.' },
    { name: 'College Girl', slug: 'college-girl', description: 'Young, energetic verified independent listings.' },
    { name: 'Air Hostess', slug: 'air-hostess', description: 'Sophisticated and polished verified models.' },
    { name: 'Celebrity', slug: 'celebrity', description: 'Exclusive celebrity & glamour verified profiles.' },
    { name: 'Housewife', slug: 'housewife', description: 'Mature, warm, and discreet verified companions.' }
  ];

  const categories = {};
  for (const cat of categoryDefs) {
    const record = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { 
        name: cat.name, 
        slug: cat.slug, 
        description: cat.description,
        h1: `${cat.name} profiles`,
        active: true 
      },
      { upsert: true, new: true, runValidators: true }
    );
    categories[cat.slug] = record;
  }
  const categoryKeys = Object.keys(categories);

  // Parse all cities and assign unique slugs
  const processedCities = [];
  const usedSlugs = new Set();
  
  // Existing cities in DB to preserve their slugs if matches
  const existingCities = await City.find({}).lean();
  const existingBySlug = new Map(existingCities.map(c => [c.slug, c]));

  let sortCounter = 1;

  for (const rawName of rawList) {
    let name = rawName.trim();
    if (!name) continue;

    // Standardize some known typos if present
    if (name.toLowerCase() === 'danaalore') name = 'Bangalore';
    if (name.toLowerCase() === 'kishanaarh') name = 'Kishangarh';
    if (name.toLowerCase() === 'gangaput') name = 'Gangapur';

    const lowerName = name.toLowerCase();
    let baseSlug = makeValidSlug(name);
    if (!baseSlug) baseSlug = 'city';

    let state = stateHints[lowerName] || 'India';

    let uniqueSlug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(uniqueSlug);

    processedCities.push({
      name,
      slug: uniqueSlug,
      state,
      tier: ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Pune'].includes(name) ? 'Metro' : 'Tier-2',
      sortOrder: sortCounter++,
      active: true,
      areas: [
        `${name} Centre`,
        `${name} Civil Lines`,
        `${name} Main Road`
      ],
      description: `Explore top verified and independent adult profiles in ${name}, ${state} with genuine photos and direct contact.`,
      h1: `Verified adult profiles in ${name}`,
      seoTitle: `Profiles in ${name}, ${state} | Veloura`.slice(0, 70),
      seoDescription: `Discover genuine 18+ verified profiles in ${name}, ${state}. Safe, discreet, and fast contact on Veloura.`.slice(0, 170)
    });
  }

  console.log(`Processed ${processedCities.length} cities to insert/update.`);

  // Save to backend/data/indian-cities.json
  const citiesJsonPath = path.join(__dirname, '../data/indian-cities.json');
  fs.writeFileSync(citiesJsonPath, JSON.stringify(processedCities, null, 2));
  console.log(`✓ Updated ${citiesJsonPath}`);

  // Upsert all cities into MongoDB
  const cityDocs = [];
  for (const item of processedCities) {
    const doc = await City.findOneAndUpdate(
      { slug: item.slug },
      {
        name: item.name,
        slug: item.slug,
        state: item.state,
        tier: item.tier,
        sortOrder: item.sortOrder,
        active: true,
        areas: item.areas,
        description: item.description,
        h1: item.h1,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription
      },
      { upsert: true, new: true, runValidators: true }
    );
    cityDocs.push(doc);
  }
  console.log(`✓ Saved ${cityDocs.length} cities in MongoDB.`);

  // Now create profiles for all cities!
  const firstNames = [
    'Aarohi', 'Priya', 'Tanya', 'Maya', 'Kiara', 'Naina', 'Riya', 'Ananya', 
    'Simran', 'Pooja', 'Neha', 'Sneha', 'Shreya', 'Divya', 'Aisha', 'Muskan', 
    'Natasha', 'Alisha', 'Ritu', 'Meera', 'Sanya', 'Tanvi', 'Payal', 'Sonam', 
    'Karishma', 'Kriti', 'Avantika', 'Radhika', 'Isha', 'Trisha', 'Kavya', 
    'Anushka', 'Roshni', 'Payal', 'Aditi', 'Nikita', 'Jhanvi', 'Khushi', 'Rupali',
    'Sonali', 'Sheetal', 'Poonam', 'Deepika', 'Kajal', 'Anjali', 'Swati', 'Rekha'
  ];

  const badges = ['NORMAL', 'HOT', 'VIP', 'VVIP'];
  const availabilities = ['Flexible', 'Daytime', 'Evening', 'Night'];

  let totalProfiles = 0;
  let totalImages = 0;
  let nameIndex = 0;
  let imageIndex = 0;
  let phoneCounter = 9811000000;

  for (const city of cityDocs) {
    const areas = (city.areas && city.areas.length > 0) ? city.areas : [`${city.name} Centre`];

    // For each area in the city, create 1-2 profiles
    for (let aIdx = 0; aIdx < Math.min(areas.length, 2); aIdx++) {
      const area = areas[aIdx];
      const name = firstNames[nameIndex % firstNames.length];
      nameIndex++;

      const catKey = categoryKeys[(nameIndex + aIdx) % categoryKeys.length];
      const category = categories[catKey];

      const areaSlug = makeValidSlug(area);
      let profileSlug = `${name.toLowerCase()}-${city.slug}-${areaSlug}-${aIdx + 1}`.slice(0, 75).replace(/-+$/, '');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profileSlug)) {
        profileSlug = `${makeValidSlug(name)}-${city.slug.slice(0, 20)}-${aIdx + 1}`;
      }

      const age = 21 + ((nameIndex + aIdx) % 11); // 21 to 31
      const height = 158 + ((nameIndex * 3) % 18); // 158 to 175
      const badge = badges[(nameIndex + aIdx) % badges.length];
      const availability = availabilities[(nameIndex + aIdx) % availabilities.length];

      phoneCounter++;
      const phone = String(phoneCounter);
      const whatsapp = phone;

      const languages = ['Hindi', 'English'];
      if (city.state === 'Maharashtra') languages.push('Marathi');
      else if (city.state === 'Karnataka') languages.push('Kannada');
      else if (city.state === 'Tamil Nadu') languages.push('Tamil');
      else if (city.state === 'Telangana' || city.state === 'Andhra Pradesh') languages.push('Telugu');
      else if (city.state === 'West Bengal') languages.push('Bengali');
      else if (city.state === 'Punjab') languages.push('Punjabi');
      else if (city.state === 'Gujarat') languages.push('Gujarati');

      const profileData = {
        name,
        slug: profileSlug,
        city: city._id,
        category: category._id,
        description: `Independent 18+ verified companion ${name} available in ${area}, ${city.name} (${city.state}). Direct WhatsApp contact, discreet hospitality, and verified identity.`,
        displayAge: age,
        heightCm: height,
        languages,
        availability,
        area,
        phone,
        whatsapp,
        badge,
        tags: ['Verified 18+', category.name, area, 'Direct Contact', 'Discreet'],
        featured: (aIdx === 0),
        status: 'published',
        ageVerified: true,
        consentVerified: true,
        seoTitle: `${name} - Verified ${category.name} in ${city.name}`.slice(0, 70),
        seoDescription: `Connect with ${name} in ${area}, ${city.name}. Genuine verified companion profile with direct contact.`.slice(0, 170),
        publishedAt: new Date(),
        deletedAt: null
      };

      const profile = await Profile.findOneAndUpdate(
        { slug: profileSlug },
        profileData,
        { upsert: true, new: true, runValidators: true }
      );
      totalProfiles++;

      // Assign 1 to 2 profile images
      const numImages = 1 + ((nameIndex + aIdx) % 2); // 1 or 2 images
      for (let imgNum = 0; imgNum < numImages; imgNum++) {
        const chosenImg = copiedImageNames[imageIndex % copiedImageNames.length];
        imageIndex++;

        const publicId = `img-${profile.slug}-${imgNum + 1}`;
        await ProfileImage.findOneAndUpdate(
          { publicId },
          {
            profile: profile._id,
            url: `/images/profiles/${chosenImg}`,
            publicId,
            width: 800,
            height: 1000,
            format: 'jpeg',
            alt: `${profile.name} in ${area}, ${city.name}`,
            isMain: (imgNum === 0),
            sortOrder: imgNum
          },
          { upsert: true, new: true, runValidators: true }
        );
        totalImages++;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`✓ COMPLETE: Populated all cities & profiles!`);
  console.log(`✓ Total Cities in DB: ${cityDocs.length}`);
  console.log(`✓ Total Profiles Created: ${totalProfiles}`);
  console.log(`✓ Total Profile Images Linked: ${totalImages}`);
  console.log(`========================================\n`);
}

main()
  .catch((err) => {
    console.error('Error in batch seeding:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
