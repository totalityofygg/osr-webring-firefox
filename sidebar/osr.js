function _tojson (obj) {
    return JSON.stringify( obj );
}

function _clear() {
    console.log( 'Cleared Webring cache' );
    browser.storage.local.clear();
}

async function _init( sites ) {
    // load sites if missing
    if( _tojson( sites ) === '{}' ) {
        console.log( 'Reload the webring' );
        const json_hashes = await fetch( hashURI );
        const json_webring = await fetch( webrURI );
        
        let hashes = await json_hashes.json();
        let webring = await json_webring.json();
        let current = -1;
        browser.storage.local.set({ webring, hashes, current });
        console.log( 'Webring reloaded' );
        // overload
        sites = { webring, hashes, current };
    }

    hashes = sites["hashes"];
    webring = sites["webring"];
    _updateRing( sites["current"] );
}

function _updateRing( current ) {
  var len = hashes.length;
  var lst = len - 1;
  var curr = hashes.indexOf( current );
  if( curr == -1 ) {
    idx = Math.floor(Math.random() * len);
    current = hashes[idx];
    curr = idx;
  }

  browser.storage.local.set({ current });

  // create the ring!
  if( curr == 0 ) {
      prev = lst;
      next = curr+1;
  } else if ( curr == lst ) {
      prev = curr-1;
      next = 0;
  } else {
      prev = curr-1;
      next = curr+1;
  }
  p_site = webring[prev];
  c_site = webring[curr];
  n_site = webring[next];
  _updateSidebar( current );
}

function _updateSidebar( current ) {
  //Previous
  prevRing.dataset.url = p_site.url;
  prevRing.dataset.hash = hashes[prev];
  
  //Next
  nextRing.dataset.url = n_site.url;
  nextRing.dataset.hash = hashes[next];
  
  // Current
  thisRing.dataset.hash = current;
  thisRing.href = c_site.url;
  thisRing.innerHTML = c_site.name;
  author.innerHTML = c_site.owner;
  desc.innerHTML = c_site.theme;
  systems.innerHTML = c_site.rpgsystem;
}

function _handleError( error ) {
    console.log(`Error: ${error}`);
}

function _handleClick() {

  if( this.id == 'prev' || this.id == 'next' ) {
    _updateRing( this.dataset.hash );
    return;
  }

  if( this.id == 'reload' ) {
    console.log( "Flushing storage and reloading the webring" );
    _clear();
    let theWebring = browser.storage.local.get(["webring","hashes","current"]);
    theWebring
        .then( _init, _handleError )
        .then( _updateSidebar, _handleError );
    return;
  }

  if( this.id == 'random' ) {
    _updateRing( -1 );
    return;
  }

  return;
}

const extURI = browser.runtime.getURL("");
const hashURI = "https://raw.githubusercontent.com/totalityofygg/osr-webring-firefox/main/hashes.json";
const webrURI = "https://raw.githubusercontent.com/totalityofygg/osr-webring-firefox/main/webring.json";


var sites, hashes, webring;

let p_site, c_site, n_site;
let prevRing = document.querySelector("#prev");
let thisRing = document.querySelector("#curr");
let nextRing = document.querySelector("#next");

let author = document.querySelector("#author");
let desc   = document.querySelector("#desc");
let systems = document.querySelector("#systems");



const buttons = document.querySelectorAll('.btn');
buttons.forEach(function(currentBtn){
  currentBtn.addEventListener('click', _handleClick )
});


browser.windows.getCurrent({populate: true}).then((windowInfo) => {
    let theWebring = browser.storage.local.get(["webring","hashes","current"]);
    theWebring
        .then( _init, _handleError )
        .then( _updateSidebar, _handleError );
});
