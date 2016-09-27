'use strict';

/* Kontrolery */

angular.module('7minWorkout')
  .controller('WorkoutController', ['$scope', '$interval', '$location', 'workoutHistoryTracker', 'appEvents', function ($scope, $interval, $location, workoutHistoryTracker, appEvents) {
      function WorkoutPlan(args) {
          this.exercises = [];
          this.name = args.name;
          this.title = args.title;
          this.restBetweenExercise = args.restBetweenExercise;
          this.totalWorkoutDuration = function () {
              if (this.exercises.length == 0) return 0;
              var total = 0;
              angular.forEach(this.exercises, function (exercise) {
                  total = total + exercise.duration;
              });
              return this.restBetweenExercise * (this.exercises.length - 1) + total;
          }
      };

      function Exercise(args) {
          this.name = args.name;
          this.title = args.title;
          this.description = args.description;
          this.image = args.image;
          this.related = {};
          this.related.videos = args.videos;
          this.nameSound = args.nameSound;
          this.procedure = args.procedure;
      }

      var restExercise; 
      var exerciseIntervalPromise;
      var startWorkout = function () {
          $scope.workoutPlan = createWorkout();
          $scope.workoutTimeRemaining = $scope.workoutPlan.totalWorkoutDuration();
          restExercise = {
              details: new Exercise({
                  name: "rest",
                  title: "Odpoczynek!",
                  description: "Odpocznij trochę!",
                  image: "img/rest.png",
              }),
              duration: $scope.workoutPlan.restBetweenExercise
          };
          workoutHistoryTracker.startTracking();
          $scope.currentExerciseIndex = -1;
          startExercise($scope.workoutPlan.exercises[0]);
      };

      var startExercise = function (exercisePlan) {
          $scope.currentExercise = exercisePlan;
          $scope.currentExerciseDuration = 0;

          if (exercisePlan.details.name != 'rest') {
              $scope.currentExerciseIndex++;
              $scope.$emit(appEvents.workout.exerciseStarted, exercisePlan.details);
          }

          exerciseIntervalPromise = startExerciseTimeTracking();
      };

      var getNextExercise = function (currentExercisePlan) {
          var nextExercise = null;
          if (currentExercisePlan === restExercise) {
              nextExercise = $scope.workoutPlan.exercises[$scope.currentExerciseIndex + 1];
          }
          else {
              if ($scope.currentExerciseIndex < $scope.workoutPlan.exercises.length - 1) {
                  nextExercise = restExercise;
              }
          }
          return nextExercise;
      };

      $scope.pauseWorkout = function () {
          $interval.cancel(exerciseIntervalPromise);
          $scope.workoutPaused = true;
      };

      $scope.resumeWorkout = function () {
          exerciseIntervalPromise = startExerciseTimeTracking();
          $scope.workoutPaused = false;
      };

      $scope.pauseResumeToggle = function () {
          if ($scope.workoutPaused) {
              $scope.resumeWorkout();
          }
          else {
              $scope.pauseWorkout();
          }
      }

      var startExerciseTimeTracking = function () {
          var promise = $interval(function () {
              ++$scope.currentExerciseDuration;
              --$scope.workoutTimeRemaining;
          }, 1000, $scope.currentExercise.duration - $scope.currentExerciseDuration);

          promise.then(function () {
              var next = getNextExercise($scope.currentExercise);
              if (next) {
                  startExercise(next);
              }
              else {
                  workoutComplete();
              }
          }, function (error) {
              console.log('Obietnica $interval anulowana. Powód: ' + error);
          });
          return promise;
      }

      var workoutComplete = function () {
          workoutHistoryTracker.endTracking(true);
          $location.path('/finish');
      }

      $scope.onKeyPressed = function (event) {
          if (event.which == 80 || event.which == 112) {        // naciśnięcie klawisza P (litery 'p' lub 'P') 
              $scope.pauseResumeToggle();                       // powoduje przełączenie stanu aplikacji
          }
      };

      //$scope.$watch('currentExerciseDuration', function (nVal) {
      //    if (nVal == $scope.currentExercise.duration) {
      //        var next = getNextExercise($scope.currentExercise);
      //        if (next) {
      //            startExercise(next);
      //        } else {
      //            console.log("Trening został zakończony!");
      //        }
      //    }
      //});

      var createWorkout = function () {
          var workout = new WorkoutPlan({
              name: "7minWorkout",
              title: "7-minutowy trening",
              restBetweenExercise: 10
          });

          workout.exercises.push({
              details: new Exercise({
                  name: "jumpingJacks",
                  title: "Pajacyki",
                  description: "Pajacyki to proste ćwiczenie fizyczne polegające na podskakiwaniu i wymachiwaniu rękoma.",
                  image: "img/JumpingJacks.png",
                  nameSound: "content/jumpingjacks.wav",
                  videos: ["dmYwZH_BNd0", "BABOdJ-2Z6o", "c4DAnQ6DtF8"],
                  procedure: "Stań w pozycji wyprostowanej, złącz stopy, a ramiona opuść swobodnie wzdłuż tułowia. \
                              <br/>Zegnij lekko kolana, a następnie wyskocz kilkanaście centymetrów w górę. \
                              <br/>W wyskoku rozłącz nogi, mniej więcej na szerokość ramion lub nieco szerzej, i jednocześnie wykonaj lekko zgiętymi w łokciach rękoma wymach nad głową. \
                              <br/>Po wylądowaniu na podłodze stopy są rozstawione na szerokość ramion, a lekko zgięte, uniesione nad głowę ręce stykają się dłońmi. "
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "wallSit",
                  title: "Krzesełko",
                  description: "Krzesełko to popularne ćwiczenie wzmacniające mięsień czworogłowy uda.",
                  image: "img/wallsit.png",
                  nameSound: "content/wallsit.wav",
                  videos: ["y-wV4Venusw", "MMV3v4ap4ro"],
                  procedure: "Stań przy ścianie, opierając się o nią plecami. \
                              <br/>Stopy rozstaw na szerokość ramion i nieco odsuń od ściany. \
                              <br/>Następnie, wciąż opierając się o ścianę, zsuwaj tułów w dół aż do momentu, gdy nogi zgięte w kolanach utworzą kąt prosty. \
                              <br/>Wytrzymaj chwilę w tej pozycji."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "pushUp",
                  title: "Pompki",
                  description: "Pompki to popularne ćwiczenie wykonywane w pozycji leżącej na brzuchu, polegające na podnoszeniu i opuszczaniu ciała na rękach.",
                  image: "img/Pushup.png",
                  nameSound: "content/pushups.wav",
                  videos: ["Eh00_rniF8E", "ZWdBqFLNljc", "UwRLWMcOdwI", "ynPwl6qyUNM", "OicNTT2xzMI"],
                  procedure: "Połóż się na brzuchu, zegnij ręce w łokciach, a dłonie rozstawione na szerokość ramion lub nieco szerzej oprzyj na podłodze. \
                              Utrzymując ciało w jednej linii, podnieś się na rękach, aż do ich całkowitego wyprostowania. \
                              Wciąż zachowując linię prostą ciała, opuść się ku ziemi, zginając ręce w łokciach."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "crunches",
                  title: "Napinanie brzucha",
                  description: "Proste napinanie mięśni brzucha jest podstawowym ćwiczeniem programu wzmacniającego.",
                  image: "img/crunches.png",
                  nameSound: "content/crunches.wav",
                  videos: ["Xyd_fa5zoEU", "MKmrqcoCZ-M"],
                  procedure: "Połóż się na plecach, zegnij nogi w kolanach i postaw stopy rozsunięte na szerokość bioder na podłodze. \
                              Oprzyj dłonie z tyłu głowy tak, by kciuki znalazły się za uszami. \
                              Łokcie rozchyl na boki i lekko unieś. \
                              Delikatnie napnij mięśnie brzucha i unieś, odrywając od podłogi, tylko głowę, szyję oraz ramiona. \
                              Utrzymaj przez chwilę taką pozycję, a następnie z powrotem opuść górną część ciała na podłogę."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "stepUpOntoChair",
                  title: "Wchodzenie na krzesło",
                  description: "Wchodzenie na krzesło jest doskonałym ćwiczeniem do budowania mięśni dolnych partii ciała.",
                  image: "img/stepUpOntoChair.png",
                  nameSound: "content/stepup.wav",
                  videos: ["aajhW7DD1EA"],
                  procedure: "Ustaw krzesło przed sobą. \
                              Stań w lekkim rozkroku, tak aby stopy były oddalone od siebie na szerokość ramion, a ręce opuść swobodnie wzdłuż ciała. \
                              Postaw jedną stopę na krześle, a następnie wejdź na krzesło, dostawiając drugą stopę. \
                              Zejdź z krzesła, zaczynając do pierwszej stopy, potem zdejmij z niego drugą stopę i stań w pozycji wyjściowej."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "squat",
                  title: "Przysiady",
                  description: "Przysiady są złożonym ćwiczeniem obejmującym wiele partii ciała i trenującym głównie mięśnie ud, bioder i pośladków.",
                  image: "img/squat.png",
                  nameSound: "content/squats.wav",
                  videos: ["QKKZ9AGYTi4", "UXJrBgI2RxA"],
                  procedure: "Stań prosto w rozkroku na szerokość ramion, klatkę piersiową wypnij do przodu. \
                              Wyciągnij ręce w poziomie przed siebie. Zginając kolana, obniżaj ciało tak, jakbyś chciał usiąść na krześle. \
                              Trzymaj głowę prosto i patrz przed siebie, pochylając jednocześnie górną część ciała do przodu. \
                              Nie wyginaj tułowia w łuk, a jedynie nieznacznie wypnij go w dolnej części ku przodowi. \
                              Zginaj kolana do momentu, gdy uda ustawią się równolegle do podłogi, a kolana znajdą się nad kostkami. \
                              Przenieś ciężar ciała na pięty. Napnij mięśnie, a następnie podnieś się do pozycji wyjściowej."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "tricepdips",
                  title: "Pompki w podporze tyłem",
                  description: "Pompki w podporze tyłem to ćwiczenie na masę mięśniową trenujące głównie triceps.",
                  image: "img/tricepdips.png",
                  nameSound: "content/tricepdips.wav",
                  videos: ["tKjcgfu44sI", "jox1rb5krQI"],
                  procedure: "Usiądź na krześle. Nogi lekko wyprostuj, a stopy postaw płasko na podłodze. \
                              Oprzyj śródręcze dłoni tuż przy krawędzi krzesła, tak aby palce były skierowane pionowo w dół. \
                              Nie poruszając nogami, przesuń pośladki do przodu, poza krzesło. \
                              Powoli opuść ciało. Kiedy ręce w łokciach będą zgięte pod kątem 90 stopni, zatrzymaj się, po czym powoli podnieś ciało w górę do pozycji wyjściowej."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "plank",
                  title: "Leżenie w podporze",
                  description: "Leżenie w podporze jest jednym z podstawowych siłowych ćwiczeń izometrycznych, polegających na utrzymywaniu trudnej pozycji przez dłuższy czas.",
                  image: "img/Plank.png",
                  nameSound: "content/plank.wav",
                  videos: ["pSHjTRCQxIw", "TvxNkmjdhMM"],
                  procedure: "Połóż się na brzuchu i przyjmij pozycję jak podczas robienia pompek. \
                              Zegnij łokcie pod kątem 90 stopni i oprzyj ciężar ciała na przedramionach. \
                              Łokcie powinny się znajdować bezpośrednio pod barkami, a ciało tworzy linię prostą, zaczynając od głowy, a kończąc na stopach. \
                              Wytrzymaj chwilę w tej pozycji."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "highKnees",
                  title: "Podnoszenie kolan",
                  description: "Podnoszenie kolan, popularnie określane jako skip-A, rozwija siłę i wytrzymałość zginaczy, mięśnia czworogłowego uda oraz mięśni prostowników uda.",
                  image: "img/highknees.png",
                  nameSound: "content/highknees.wav",
                  videos: ["OAJ_J3EZkdY", "8opcQdC-V-U"],
                  procedure: "Stań prosto w rozkroku na szerokość ramion. \
                              Podnieś kolano w górę, dociągając je maksymalnie do klatki piersiowej. \
                              Powtórz ćwiczenie na drugą nogę."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "lunges",
                  title: "Wypady",
                  description: "Wypady są dobrym ćwiczeniem do wzmacniania, rzeźbienia i budowania kilku grup mięśni, w tym mięśnia czworogłowego, mięśni pośladkowych, jak również ścięgien podkolanowych.",
                  image: "img/lunges.png",
                  nameSound: "content/lunge.wav",
                  videos: ["Z2n58m2i4jg"],
                  procedure: "Stań prosto w rozkroku na szerokość ramion. \
                              Połóż ręce na biodrach, wyprostuj plecy, rozluźnij ramiona i patrz przed siebie. \
                              Jedną nogą zrób duży wykrok w przód. \
                              W trakcie wykonywania wykroku zniż biodra i zegnij nogi w kolanach tak, by łydki i uda tworzyły kąt prosty. \
                              Wróć do pozycji wyjściowej. Powtórz ćwiczenie na drugą nogę."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "pushupNRotate",
                  title: "Pompki z obrotem",
                  description: "Pompki z obrotem to wersja pompek wymagająca dodatkowo wykonania obrotu.",
                  image: "img/pushupNRotate.png",
                  nameSound: "content/pushupandrotate.wav",
                  videos: ["qHQ_E-f5278"],
                  procedure: "Przyjmij klasyczną pozycję do pompek, ale podczas podnoszenia się obróć się tak, by wyprostowana prawa ręka znalazła się w górze nad głową. \
                              Wróć do pozycji wyjściowej, a następnie powtórz ćwiczenie, wyciągając ku górze lewą rękę."
              }),
              duration: 30
          });
          workout.exercises.push({
              details: new Exercise({
                  name: "sidePlank",
                  title: "Unoszenie bioder bokiem",
                  description: "Unoszenie bioder bokiem to wariant leżenia w podporze wykonywany w pozycji bocznej.",
                  image: "img/sideplank.png",
                  nameSound: "content/sideplank.wav",
                  videos: ["wqzrb67Dwf8", "_rdfjFSFKMY"],
                  procedure: "Połóż się na boku tak, aby ciało tworzyło linię prostą od głowy do stóp, opierając ciężar na przedramieniu. \
                              Łokieć powinien się znajdować bezpośrednio poniżej barku. \
                              Ściśnij lekko pośladki i delikatnie unieś biodra, zachowując linię prostą ciała. \
                              Trzymaj biodra prosto, a szyję w jednej linii z kręgosłupem. \
                              Wytrzymaj chwilę w takiej pozycji."
              }),
              duration: 30
          });
          return workout;
      }

      var init = function () {
          startWorkout();
      };

      init();
  }]);

angular.module('7minWorkout')
  .controller('WorkoutAudioController', ['$scope', '$interval', '$location', '$timeout', function ($scope, $interval, $location, $timeout) {
      $scope.exercisesAudio = [];

      var workoutPlanwatch = $scope.$watch('workoutPlan', function (newValue, oldValue) {
          if (newValue) {
              angular.forEach($scope.workoutPlan.exercises, function (exercise) {
                  $scope.exercisesAudio.push({ src: exercise.details.nameSound, type: "audio/wav" });
              });
              workoutPlanwatch();       // przerywamy obserwację zmian właściwości
          }
      });

      $scope.$watch('currentExercise', function (newValue, oldValue) {
          if (newValue && newValue != oldValue) {
              if ($scope.currentExercise.details.name == 'rest') {
                  $timeout(function () {
                      $scope.nextUpAudio.play();
                  }, 2000);
                  $timeout(function () {
                      $scope.nextUpExerciseAudio.play($scope.currentExerciseIndex + 1, true);
                  }, 3000);
              }
          }
      });

      $scope.$watch('currentExerciseDuration', function (newValue, oldValue) {
          if (newValue) {
              if (newValue == Math.floor($scope.currentExercise.duration / 2) && $scope.currentExercise.details.name != 'rest') {
                  $scope.halfWayAudio.play();
              }
              else if (newValue == $scope.currentExercise.duration - 3) {
                  $scope.aboutToCompleteAudio.play();
              }
          }
      });

      $scope.$watch('workoutPaused', function (newValue, oldValue) {
          if (newValue) {
              $scope.ticksAudio.pause();
              $scope.nextUpAudio.pause();
              $scope.nextUpExerciseAudio.pause();
              $scope.halfWayAudio.pause();
              $scope.aboutToCompleteAudio.pause();
          }
          else {
              $scope.ticksAudio.play();
              if ($scope.halfWayAudio.currentTime > 0 && $scope.halfWayAudio.currentTime < $scope.halfWayAudio.duration) $scope.halfWayAudio.play();
              if ($scope.aboutToCompleteAudio.currentTime > 0 && $scope.aboutToCompleteAudio.currentTime < $scope.aboutToCompleteAudio.duration) $scope.aboutToCompleteAudio.play();
          }
      });

      var init = function () {
      }

      init();

  }]);