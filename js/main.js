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

const Model = (function(){
   
    return {
        handleAllJobs: function(){
            jobs.fetchAll()
            .then(jobs => {
                View.displayJobs(jobs);
                View.displayNumberOfJobs(jobs);
            });
        },
        
        handleSingleJob: function(id){
            jobs.fetchOne(id)
            .then(job => {
                View.displayOneJob(job);
            });
        },

        shortenDate: function(date){
            return date.substring(0,10);
        },

        storeAdsInLocalStorage: function(myAds){
            //Save the input (the array of ads) as strings in localStorage
            localStorage.setItem("myAds", JSON.stringify(myAds));
        },

        getLocallyStoredAds: function(){ 
            //Fetch array from local storage
            var storedAds = localStorage.getItem("myAds");
        
            //If there are no saved ads
            if (storedAds == null){
                //Define an empty array, otherwise the user won't be able to push anything into it
                return [];
            } else {
                //Turn array back from string to regular array - and return it
                return JSON.parse(storedAds); 
            }
        }
    }
}());

const Controller = (function (){ 
    
    return {
        bindHomePageEventListeners: function(){
            const allButtons = document.querySelectorAll('button');
            for(button of allButtons){
                if(button.classList.contains('showAd')){
                    let adID = button.dataset.id;
                    button.addEventListener('click', function(){
                        Model.handleSingleJob(adID);
                    });
                }
                if(button.classList.contains('saveAd')){
                    let adID = button.dataset.id;
                    button.addEventListener('click', function(){
                        // We push the clicked ad into our locally stored ads
                        let myAds = Model.getLocallyStoredAds();
                        myAds.push(adID);           
                        Model.storeAdsInLocalStorage(myAds);
                        console.log(Model.getLocallyStoredAds())     
                    });
                }
            }
        },

        bindSingleJobPageEventListeners: function(){
            const homeButton = document.getElementById('returnButton');
            homeButton.addEventListener('click', Model.handleAllJobs);

            const shareButton = document.getElementById('shareButton');
            const linkContainer = document.getElementById('linkContainer');
            shareButton.addEventListener('click', function(){
                View.toggleClassHidden(linkContainer);
            })
        }
    }
})();

const View = (function(){
    const wrapper = document.getElementById('wrapper');
    const numberOfJobsWrapper = document.getElementById('numberOfJobs');

     return {
        // View 10 latest ads
        displayJobs: function(jobs) {
            jobs = jobs.matchningslista.matchningdata;
            let jobInfo = ``;
            
            for(let job of jobs){
                //let shortenedDate = Model.shortenDate(job.sista_ansokningsdag);
                let shortenedDate = job.sista_ansokningsdag;
                jobInfo += `<div class="job-wrapper">
                <h2>${job.annonsrubrik}</h2>
                <p>Arbetsplats: ${job.arbetsplatsnamn}</p>
                <p>Kommun: ${job.kommunnamn}</p>
                <p>Sista ansökningsdag: ${shortenedDate}</p>
                <p>Yrkesroll: ${job.yrkesbenamning}</p>
                <p>Anställningstyp: ${job.anstallningstyp}</p>
                <a href="${job.annonsurl}">Länk till annons</a><br>
                <button class="saveAd" data-id="${job.annonsid}">Spara annons</button>
                <button class="showAd" data-id="${job.annonsid}">Visa annons</button>
                </div>`;
            }
            wrapper.innerHTML = jobInfo;
            Controller.bindHomePageEventListeners();
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
                <button id="returnButton">Tillbaka</button>
                <h2>${job.annons.annonsrubrik}</h2>
                <h3>Kommun: ${job.annons.kommunnamn}</h3>
                <p>${job.annons.annonstext.replace(/(\r\n|\n|\r)/gm, '<br />')}</p>
                <button id="shareButton">Dela annons</button>
                <div id="linkContainer" class="hidden">Länk till annons: <a href="${job.annons.platsannonsUrl}">${job.annons.platsannonsUrl}</a></div>
                </div>`;

            wrapper.innerHTML = jobInfo;
            Controller.bindSingleJobPageEventListeners();
        },

        toggleClassHidden: function(element){
            element.classList.toggle('hidden');
        }
     }
}());

Model.handleAllJobs();