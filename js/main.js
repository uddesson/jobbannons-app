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
    View.displayNumberOfJobs(jobs);
});

const View = (function(){
    const wrapper = document.getElementById('wrapper');
    const numberOfJobsWrapper = document.getElementById('numberOfJobs');

     return {
        // View 10 latest ads
        displayJobs: function(jobs) {
            jobs = jobs.matchningslista.matchningdata;
            let jobInfo = ``;
            for(let job of jobs){
                jobInfo += `<div id="${job.annonsid}" class="job-wrapper">
                <h2>${job.annonsrubrik}</h2>
                <p>Arbetsplats: ${job.arbetsplatsnamn}</p>
                <p>Plats: ${job.kommunnamn}</p>
                <p>Sista ansökningsdag: ${job.sista_ansokningsdag}</p>
                <p>Yrkesbenämning: ${job.yrkesbenamning}</p>
                <p>Anställningstyp: ${job.anstallningstyp}</p>
                <p>${job.annonsurl}</p>
                <button id="saveAd">Spara annons</button>
                </div>`;
            }
            wrapper.innerHTML = jobInfo;
        },

        // Shows total number of jobs in Stockholm county
        displayNumberOfJobs: function(jobs) {
            totalJobs = jobs.matchningslista.antal_platsannonser;
            let jobInfo = ``;
               jobInfo = `<h2>Just nu finns ${totalJobs} 
               jobbannonser i Stockholms län</h2>`;
               numberOfJobsWrapper.innerHTML = jobInfo;
        }
     }
}());