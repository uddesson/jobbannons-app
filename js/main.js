const wrapper = document.getElementById('wrapper');


class Fetch {
    constructor(baseUrl){
        this.baseUrl = baseUrl;
    }
    fetchAll(){
        return fetch(this.baseUrl + 'matchning?lanid=1&antalrader=10')
        .then((response) => response.json())
    }
    fetchOne(id){

    }
}

const jobs = new Fetch('http://api.arbetsformedlingen.se/af/v0/platsannonser/');
jobs.fetchAll()
.then(jobs => {
    View.displayJobs(jobs);
});

const View = {
    // View 10 latest ads
    displayJobs: (jobs) => {
        jobs = jobs.matchningslista.matchningdata;
        for(let job of jobs){
            console.log(job);
        }
    }
}