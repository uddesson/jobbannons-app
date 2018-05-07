class Fetch {
    constructor(additionalUrlParameters){
        this.additionalUrlParameters = additionalUrlParameters;
    }
    fetchAll(){
        return fetch('http://api.arbetsformedlingen.se/af/v0/platsannonser/' + this.additionalUrlParameters)
        .then((response) => response.json())
    }
    fetchOne(id){
        return fetch(this.baseUrl + id)
        .then((response) => response.json())
    }
}

const jobs = new Fetch('matchning?nyckelord=sverige&antalrader=10');

const Model = (function(){
    let pageNumber = 1; // Default value for pagination
    let searchState = false; // Default value, view differs when set to true (user is searching)

    return {
        handleAllJobs: function(){

            jobs.fetchAll()
            .then(jobs => {
                window.location.hash = `sida=${pageNumber}`;

                View.displayJobs(jobs);
                Controller.bindJobAdEventListeners();
                View.displayPagination();
                Controller.bindPaginationEventListeners();
                View.displayNumberOfJobs(jobs);
                
                if(searchState){
                    View.emptyNumberOfJobsContainer();
                }
            });
        },
        
        handleSingleJob: function(id){
            jobs.fetchOne(id)
            .then(job => {
                location.hash = `/annonsid/${id}`;
                View.emptyNumberOfJobsContainer();
                View.displayOneJob(job);
                Controller.bindSingleJobPageEventListeners();
            });
        },

        handleAllCountys: function(){
            const countyFetch = new Fetch('soklista/lan')
            countyFetch.fetchAll()
            .then((countys) => {
                View.displayCountyOptions(countys);
            })
        },

        handleAllJobCategories: function(){
            const categoriesFetch = new Fetch('soklista/yrkesomraden');
            categoriesFetch.fetchAll()
            .then((categories) => {
                View.displayJobCategories(categories);
                Controller.bindJobCategoryEventListeners();
            })
        },

        shortenDate: function(date){
            return date.substring(0,10);
        },

        storeAdsInLocalStorage: function(myAds){
            //Save the input (the array of ads) as strings in localStorage
            localStorage.setItem("myAds", JSON.stringify(myAds));
        },

        getLocallyStoredAds: function(){ 
            var storedAds = localStorage.getItem("myAds");
        
            if (storedAds == null){
                //Define an empty array, otherwise the user won't be able to push anything into it
                return [];
            } else {
                //Turn array back from string to regular array - and return it
                return JSON.parse(storedAds); 
            }
        },

        fetchBasedOnUrl: function(){
            // TODO: Make this function accept several kinds of url-endpoints
            const jobAdId = window.location.hash.split(`/`).pop();

            if (window.location.hash.includes(`#/annonsid`)) {
                Model.handleSingleJob(jobAdId);
            } else {
                Model.handleAllJobs();
            }
            
        },

        fetchBasedOnSearch: function(searchQuery){
            searchState = true;
            jobs.additionalUrlParameters = `matchning?nyckelord=${searchQuery}`;
            Model.handleAllJobs(); 
        },

        returnSelectLists: function(){
            const showJobsInCounty = document.getElementById('showJobsInCounty');
            const showNumberOfJobs = document.getElementById('showNumberOfJobs');
            let selectedCounty = showJobsInCounty[showJobsInCounty.selectedIndex].value;
            let selectedNumberOfJobs = showNumberOfJobs[showNumberOfJobs.selectedIndex].value;
            let noCountyIsSelected = false;

            if(selectedCounty === "-"){
                 noCountyIsSelected = true;
            }
            return [showJobsInCounty, selectedCounty, selectedNumberOfJobs, noCountyIsSelected];
        },

        setCustomFetchPath: function(){
            const selectedNumber = Model.returnSelectLists()[2];
            const noCountyIsSelected = Model.returnSelectLists()[3];

            // Is true when user wants to show all jobs in Sweden
            if(noCountyIsSelected){
                jobs.additionalUrlParameters = `matchning?nyckelord=sverige&antalrader=${selectedNumber}`;
            } else {
                const selectedCounty = Model.returnSelectLists()[1];
                jobs.additionalUrlParameters = `matchning?lanid=${selectedCounty}&antalrader=${selectedNumber}`;
            }
        },

        changePage: function(state, searchQuery){
            const selectedNumber = Model.returnSelectLists()[2];
            const noCountyIsSelected = Model.returnSelectLists()[3];
            
            if(state === "next"){
                pageNumber ++;
            }
            if(state === "previous" && pageNumber > 1){
                pageNumber --;
            }
            
            if(searchState){
                jobs.additionalUrlParameters = `matchning?nyckelord=${searchQuery}&antalrader=${selectedNumber}&sida=${pageNumber}`;
            } 
            else if(noCountyIsSelected) {
                jobs.additionalUrlParameters = `matchning?nyckelord=sverige&antalrader=${selectedNumber}&sida=${pageNumber}`;  
            }
            else {
                const selectedCounty = Model.returnSelectLists()[1];
                jobs.additionalUrlParameters = `matchning?lanid=${selectedCounty}&antalrader=${selectedNumber}&sida=${pageNumber}`;
            }

            Model.handleAllJobs();   
        }
    }
}());

const Controller = (function (){ 
    let searchQuery = '';

    return {
        bindHomePageEventListeners: function(){
            const displaySavedAdsHeading = document.getElementById('displaySavedAds');
            const showJobsButton = document.getElementById('showJobsButton');
            const searchButton = document.getElementById('searchButton');
            const searchBar = document.getElementById('searchBar');
            const savedAdsList = document.getElementById('savedAdsList');

            displaySavedAdsHeading.addEventListener('click', function(){
                let myAds = Model.getLocallyStoredAds();  
                View.displaySavedAds(myAds);

                let savedAdsListElements = savedAdsList.childNodes;
                let range = savedAdsList.childNodes.length;

                for(var i = 0; i < range; i++){
                    savedAdsListElements[i].addEventListener('click', function(){
                        Model.handleSingleJob(this.dataset.id);
                        window.scrollTo(0, 0);
                    })
                }
            });
          
            showJobsButton.addEventListener('click', function(event){
                event.preventDefault();
                Model.setCustomFetchPath();
                Model.handleAllJobs();
            });

            searchButton.addEventListener('click', function(event){
                
                event.preventDefault();
                searchQuery = searchBar.value;
                
                if(searchQuery.trim() === ''){
                    alert('Du måste fylla i sökfältet');
                }
                else{
                    Model.fetchBasedOnSearch(searchQuery);
                }
            
            });
        },

        bindJobCategoryEventListeners: function(){
            const jobCategories = document.querySelectorAll('.job-category');

            for(let category of jobCategories){
                category.addEventListener('click', function(){
                    let categoryId = this.dataset.id;
                    jobs.additionalUrlParameters = `matchning?yrkesomradeid=${categoryId}`;
                    Model.handleAllJobs();
                });
            }
        },

        bindJobAdEventListeners: function(){
            const allButtons = document.querySelectorAll('button');
            for(button of allButtons){
                
                if(button.classList.contains('showJobAd')){
                    let adID = button.dataset.id;
                    button.addEventListener('click', function(){
                        Model.handleSingleJob(adID);
                    });
                }

                if(button.classList.contains('saveJobAd')){
                    let adID = button.dataset.id;
                    let adTitle = button.dataset.title;
                    let adToSave = {
                        title: adTitle,
                        id: adID
                    }
                    button.addEventListener('click', function(){                       
                        let myAds = Model.getLocallyStoredAds();
                        myAds.push(adToSave);           
                        Model.storeAdsInLocalStorage(myAds);
                    });
                }
            }
            
        },

        bindSingleJobPageEventListeners: function(){
            const homeButton = document.getElementById('returnButton');
            const shareButton = document.getElementById('shareButton');
            const linkContainer = document.getElementById('linkContainer');

            homeButton.addEventListener('click', Model.handleAllJobs);

            shareButton.addEventListener('click', function(){
                View.toggleClassHidden(linkContainer);
            });
        },

        bindPaginationEventListeners: function(){
            const nextPage = document.getElementById('nextPage');
            const previousPage = document.getElementById('previousPage');

            nextPage.addEventListener('click', () => {
                Model.changePage('next',searchQuery);
                window.scrollTo(0, 0);
            });

            previousPage.addEventListener('click', () => {
                Model.changePage('previous',searchQuery);
                window.scrollTo(0, 0);
            });
        },
        
        checkCurrentUrl: function () {
            window.addEventListener('hashchange', event => {
                Model.fetchBasedOnUrl();
            });
        }
    }
}());

const View = (function(){
    const container = document.getElementById('container-inner');
    const numberOfJobsContainer = document.getElementById('numberOfJobs');
    const paginationDiv = document.getElementById('pagination');
    const jobCategoriesDiv = document.getElementById('jobCategories');

     return {
        // View 10 latest ads
        displayJobs: function(jobs) {
            jobs = jobs.matchningslista.matchningdata;
            let jobInfo = ``;
            
            for(let job of jobs){
                //let shortenedDate = Model.shortenDate(job.sista_ansokningsdag);
                let shortenedDate = job.sista_ansokningsdag;
                jobInfo += `
                <div class="col-12">
                    <div class="card" style="padding: 2px;">
                        <div class="job-container card-body">
                            <h2 class="card-title">${job.annonsrubrik}</h2>
                            <h3 class="card-subtitle mb-2 text-muted">${job.arbetsplatsnamn}</h3>
                            <p class="card-text">Kommun: ${job.kommunnamn}</p>
                            <p class="card-text">Sista ansökningsdag: ${shortenedDate}</p>
                            <p class="card-text">Yrkesroll: ${job.yrkesbenamning}</p>
                            <p class="card-text">Anställningstyp: ${job.anstallningstyp}</p>
                            <button class="saveJobAd btn btn-primary" data-id="${job.annonsid}" data-title="${job.annonsrubrik}">Spara annons</button>
                            <button class="showJobAd btn btn-primary" data-id="${job.annonsid}">Visa annons</button>
                            <br><a href="${job.annonsurl}" class="card-link">Länk till arbetsförmedlingen</a>
                        </div>
                    </div>
                </div>`;
            }
            container.innerHTML = jobInfo;
        },

        displayNumberOfJobs: function(jobs) {
            let totalJobs = jobs.matchningslista.antal_platsannonser;
            let location = '';
            let noCountyIsSelected = Model.returnSelectLists()[3];
            let jobInfo = '';

            if(noCountyIsSelected){
                location = 'Sverige';
            } else{
                location = jobs.matchningslista.matchningdata[0].lan;
            }

            jobInfo = `<h2>Just nu finns ${totalJobs} 
            jobbannonser i ${location}</h2>`;
            numberOfJobsContainer.innerHTML = jobInfo;
        },

        displayOneJob: function(job){
            job = job.platsannons;
            paginationDiv.innerHTML = "";

            let jobInfo = ``;
                jobInfo += `<div id="${job.annons.annonsid}" class="single-job-container">
                <button id="returnButton" class="btn btn-sm btn-outline-primary">Tillbaka</button>
                <h2>${job.annons.annonsrubrik}</h2>
                <h3>Kommun: ${job.annons.kommunnamn}</h3>
                <p>${job.annons.annonstext.replace(/(\r\n|\n|\r)/gm, '<br />')}</p>
                <button id="shareButton" class="btn btn-primary">Dela annons</button>
                <div id="linkContainer" class="hidden">Länk till annons: <a href="${job.annons.platsannonsUrl}">${job.annons.platsannonsUrl}</a></div>
                </div>`;

            container.innerHTML = jobInfo;
        },

        displayCountyOptions: function(countys){
            const showJobsInCounty = Model.returnSelectLists()[0];
            
            for(let county of countys.soklista.sokdata) {
                let countyOption = document.createElement('option');
                countyOption.innerText = county.namn;
                countyOption.value = county.id;

                showJobsInCounty.appendChild(countyOption);
            }
        },
        
        displaySavedAds: function(myAds){
            let savedAdsList = document.getElementById('savedAdsList');
            savedAdsList.innerHTML = '';

            for (var ad of myAds){
                let listElement = document.createElement('li');
                listElement.dataset.id = ad.id;
                listElement.classList.add('list-group-item','d-flex','align-items-center')
                listElement.innerText = ad.title;

                savedAdsList.appendChild(listElement);
            }

            View.toggleClassHidden(savedAdsList);
        },

        toggleClassHidden: function(element){
            element.classList.toggle('hidden');
        },

        displayPagination: function(){   
            paginationDiv.innerHTML = "";

            const nextPage = document.createElement('button');
            nextPage.type = "button";
            nextPage.classList.add('btn','btn-sm','btn-outline-primary');
            const previousPage = document.createElement('button');
            nextPage.type = "button";
            previousPage.classList.add('btn','btn-sm','btn-outline-primary');

            nextPage.id = "nextPage";
            previousPage.id = "previousPage";

            nextPage.innerText = "Nästa";
            previousPage.innerText = "Föregående";
            
            paginationDiv.appendChild(previousPage);
            paginationDiv.appendChild(nextPage);
        },

        displayJobCategories: function(categories){
            let categoryList = ""

            for(let category of categories.soklista.sokdata){ 
                categoryList += `<li class="job-category list-group-item d-flex justify-content-between align-items-center" 
                data-id="${category.id}">${category.namn} 
                <span class="badge badge-primary badge-pill">${category.antal_ledigajobb}</span>
                </li>`
            }

            jobCategoriesDiv.innerHTML = categoryList;
        },

        emptyNumberOfJobsContainer: function(){
            numberOfJobsContainer.innerHTML = "";
        }
     }
}());

Model.handleAllCountys();
Controller.checkCurrentUrl();
Model.fetchBasedOnUrl();
Model.handleAllJobCategories();
Controller.bindHomePageEventListeners();