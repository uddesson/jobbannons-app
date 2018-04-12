


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
                
                jobInfo += `<div class="job-wrapper">
                <h2>${job.annonsrubrik}</h2>
                <p>${job.arbetsplatsnamn}</p>
                <p>${job.kommunnamn}</p>
                <p>Sista ansökningsdag: ${job.sista_ansokningsdag}</p>
                <p>Yrkesbenämning: ${job.yrkesbenamning}</p>
                <p>Anställningstyp: ${job.anstallningstyp}</p>
                <p>${job.annonsurl}</p>
                </div>`;
            }
            wrapper.innerHTML = jobInfo;
        },

        displayNumberOfJobs: function(jobs) {
            totalJobs = jobs.matchningslista.antal_platsannonser;
            let jobInfo = ``;
               jobInfo = `<h2>${totalJobs}</h2>`;
               numberOfJobsWrapper.innerHTML = jobInfo;
        }
     }
}());