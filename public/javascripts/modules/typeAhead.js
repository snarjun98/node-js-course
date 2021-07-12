const axios = require('axios')
import dompurify from 'dompurify';
function searchResultsHTML(stores){
    return stores.map(store=>{
        return `
        <a href="/stores/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
        </a>`;
    }).join('')
}
function typeAhead(search){
    
if(!search) return;
const searchInput=search.querySelector('input[name="search"]');
const searchResults = search.querySelector('.search__results');

searchInput.on('input',function(){
    //if there is no value input
    if(!this.value){
        searchResults.style.display='none';
        return;//stop
    }
    searchResults.style.display='block';
    axios.get(`/api/search?q=${this.value}`).then(res=>{
        if(res.data.length) {
            const html = dompurify.sanitize(searchResultsHTML(res.data));
            searchResults.innerHTML = html;
            return;
        }
        //tell them nothing came back
        searchResults.innerHTML=dompurify.sanitize(`
        <div class="search__result">No results for ${this.value}</div>
        `);
    }).catch(err=>{
        console.error(err);
    })
})

}
export default typeAhead;