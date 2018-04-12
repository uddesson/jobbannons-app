class Fetch {
    constructor(baseUrl){
        this.baseUrl = baseUrl;
    }
    fetchAll(){
        return fetch(this.baseUrl + 'matchning?lanid=1&antalrader=10')
        .then((response) => response.json())
    }
    fetchOne(id){
        return fetch(this.baseUrl + id)
        .then((response) => response.json())
    }
}

const jobs = new Fetch('http://api.arbetsformedlingen.se/af/v0/platsannonser/');

const FetchModel = (function(){
    return{
        fetchAllJobs: function(){
            jobs.fetchAll()
            .then(jobs => {
                View.displayJobs(jobs);
                View.displayNumberOfJobs(jobs);
            });
        },
        
        fetchSingleJob: function(id){
            jobs.fetchOne(id)
            .then(job => {
                View.displayOneJob(job);
            });
        }
    }
}());


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
                <p>Arbetsplats: ${job.arbetsplatsnamn}</p>
                <p>Plats: ${job.kommunnamn}</p>
                <p>Sista ansökningsdag: ${job.sista_ansokningsdag}</p>
                <p>Yrkesbenämning: ${job.yrkesbenamning}</p>
                <p>Anställningstyp: ${job.anstallningstyp}</p>
                <p>${job.annonsurl}</p>
                <button class="saveAd">Spara annons</button>
                <button class="showAd" data-id="${job.annonsid}">Visa annons</button>
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
        },

        displayOneJob: function(job){
            job = job.platsannons;

            let jobInfo = ``;
                jobInfo += `<div id="${job.annons.annonsid}" class="single-job-wrapper">
                <button id="back">Tillbaka</button>
                <h2>${job.annons.annonsrubrik}</h2>
                <h3>Kommun: ${job.annons.kommunnamn}</h3>
                <p>${job.annons.annonstext.replace(/(\r\n|\n|\r)/gm, '<br />')}</p>
                </div>`;

            wrapper.innerHTML = jobInfo;
            var backButton = document.getElementById('back');
            backButton.addEventListener('click', FetchModel.fetchAllJobs);
        }
     }
}());

FetchModel.fetchSingleJob('7665589');