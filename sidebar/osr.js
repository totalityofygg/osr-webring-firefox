function _tojson (obj) {
    return JSON.stringify( obj );
}

// Clear the entire cache
function _clear() {
    console.log( 'Cleared Webring cache' );
    browser.storage.local.clear();
}


// Initialization function
async function _init( sites ) {
    if( _tojson( sites ) === '{}' ) {
        console.log( 'Reload the webring' );
        const json_hashes = await fetch( hashURI );
        const json_webring = await fetch( webrURI );
        const json_ts = await fetch( timeURI );
        
        let hashes = await json_hashes.json();
        let webring = await json_webring.json();
        let ts = await json_ts.json();
        let current = "c85fda9e4c95d8f3326e84d23d998684";

        browser.storage.local.set({ webring, hashes, current, ts });
        console.log( 'Webring reloaded' );
        // overload
        sites = { webring, hashes, current, ts };
    }
    hashes = sites["hashes"];
    webring = sites["webring"];
    last_update = sites["ts"];
    _updateRing( sites["current"] );
}


// update the webring
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

// update the sidebar display
function _updateSidebar( current ) {
  //Previous
  prevRing.dataset.url = p_site.url;
  prevRing.dataset.hash = hashes[prev];
  
  //Next
  nextRing.dataset.url = n_site.url;
  nextRing.dataset.hash = hashes[next];
  
  // Current
  thisRing.dataset.hash = current;
  thisRing.href = c_site.url + '?utm_source=osr-webring';

  thisRing.textContent = c_site.name;
  author.textContent = c_site.owner;
  desc.textContent = c_site.theme;
  systems.textContent = c_site.rpgsystem;

  // timestamp
  update.textContent = "Last update: " + last_update["dte"];
  
}

function _handleError( error ) {
    console.log(`Error: ${error}`);
}


// wrapper function for click events
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
const timeURI = "https://raw.githubusercontent.com/totalityofygg/osr-webring-firefox/main/timestamp.json";


var sites, hashes, webring, lastupdate;

let p_site, c_site, n_site;
let prevRing = document.querySelector("#prev");
let thisRing = document.querySelector("#curr");
let nextRing = document.querySelector("#next");

let author = document.querySelector("#author");
let desc   = document.querySelector("#desc");
let systems = document.querySelector("#systems");

let update = document.querySelector("#ts" );

const buttons = document.querySelectorAll('.btn');
buttons.forEach(function(currentBtn){
  currentBtn.addEventListener('click', _handleClick )
});


browser.windows.getCurrent({populate: true}).then((windowInfo) => {
    let theWebring = browser.storage.local.get(["webring","hashes","current","ts"]);
    theWebring
        .then( _init, _handleError )
        .then( _updateSidebar, _handleError );
});
