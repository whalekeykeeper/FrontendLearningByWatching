<script>
import axios from 'axios';

export default {
  components: {},
  data() {
    return {
      aText: '',
      sentList: [],
      defaultSentList: [],
      allWords: [],
      search_base: 'http://127.0.0.1:5000/search/',
      res: '',
      clicked: [], //basing on time
      video_request_base: 'http://127.0.0.1:5000/video/',
      caption_request_base: 'http://127.0.0.1:5000/caption/bi/',
      video_request: '',
      caption_request: '',
      url: '',
      video_id: '',
      currentCues: [],
      tokenizedCues: [],
      isLoadingVideo: false,
    };
  },
  methods: {
    splitText() {
      if (this.aText.length > 0) {
        let tempSents = [];
        let aSentDefault = '';
        let aSent = '';
        let aToken = '';
        let aWord = '';
        let punctuation = /[.,?!"]/g;
        tempSents = this.aText.match(/[^.!?]+[.!?]+["']?|\s*$/g);
        tempSents = tempSents.filter(function (entry) {
          return entry.trim() !== '';
        });
        for (let i = 0; i < tempSents.length; i++) {
          aSentDefault = tempSents[i].trim();
          aSent = aSentDefault.split(' ');
          aSent = aSent.filter(function (entry) {
            return entry.trim() !== '';
          });
          let s = [];
          for (let j = 0; j < aSent.length; j++) {
            if (aSent[j].trim().length > 0) {
              aToken = aSent[j];
              aWord = aToken.replace(punctuation, '');
              s.push({
                token: aToken,
                word: aWord,
              });
            }
          }
          this.sentList.push({ sentence: aSentDefault, words: s });
        }
      } else {
        console.log('There is no text input.');
      }
    },
    fetchData(w, clickedSent) {
      console.log("The clicked word is: ")
      console.log(w)
      axios
        .get(this.search_base + String(w)+"/"+String(clickedSent))
        .then((resp) => {
          this.res = resp.data;
          let x = [];
          x.push(w);
          x.push(this.res);
          x.push(clickedSent);
          this.clicked.push(Array(w, this.res, clickedSent));
          console.log(this.res);
          console.log(clickedSent);
          console.log(' x: ');
          console.log(x);
          console.log(this.clicked.length);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    updateRequests(url) {
      console.log(url);
      let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      let match = url.match(regExp);
      this.video_id = match && match[7].length === 11 ? match[7] : false;
      this.video_request = this.video_request_base + this.video_id;
      this.caption_request = this.caption_request_base + this.video_id;
      console.log("this.video_request: ", this.video_request);
      console.log(this.video_request);
      console.log("this.caption_request: ", this.caption_request);
      console.log(this.caption_request);
    },
    updateCurrentCues() {
      const trackElement = this.$refs['bilingual-caption'];
      // console.log("trackElement in updateCurrentCues(): ")
      // console.log(trackElement);
      if (trackElement && trackElement.track && trackElement.track.activeCues) {
        const activeCues = trackElement.track.activeCues;
        this.currentCues = Array.from(activeCues);
        // console.log("this.currentCues: ", this.currentCues);
        // this.sendCuesToBackend();
      } else {
        this.currentCues = [];
      }
    },
    getDictionary(w, clickedSent) {
      axios
          .get(this.search_base + String(w))
          .then((resp) => {
            // This is a function inside a function
            // resp is a function parameter
            this.res = resp.data['found'];
            let x = [];
            x.push(w);
            x.push(this.res);
            x.push(clickedSent);
            this.clicked.push(Array(w, this.res, clickedSent));
            console.log(w);
            console.log(this.res);
            console.log(clickedSent);
            console.log(' x: ');
            console.log(x);
            console.log(this.clicked.length);
          })
          .catch((err) => {
            console.log(err);
          });

      // console.log(this.res);
    },
  },
};
</script>

<template>
  <v-app>
    <v-main>
      <v-container align="center">
        <v-sheet :max-width="$vuetify.display.mobile? '100%' : '80%'">
          <div class="middle">

          <h1>Learning by watching</h1>
          <div>
            <v-text-field v-model="url" :append-icon="'mdi-send'" density="compact" label="Youtube Link" type="url"
                          name="url" @click:append="updateRequests(url)" @keyup.enter="updateRequests(url)"></v-text-field>
          </div>

          <v-row>
            <v-card class="mt-1" style="min-height: 550px">
              <video
                  ref="video-player"
                  width="800"
                  height="450"
                  controls
                  :src="video_request"
                  type="video/mp4"
                  crossorigin="anonymous"
                  @timeupdate="updateCurrentCues"
              >
                <track
                    default
                    kind="metadata"
                    label="BILINGUAL"
                    srclang="bi"
                    :src="caption_request"
                    ref="bilingual-caption"
                />

              </video>

              <div>
                <div v-for="(cue, index) in currentCues" :key="index">
                  <div v-for="mono_cue in cue.text.split('§')">
                  <span
                      v-for="word in mono_cue.split(' ')"
                      @click="fetchData(word, mono_cue)"
                      class="text-h5 click">
                    {{ word }}&nbsp;
                  </span>
                  </div>
                </div>
              </div>
            </v-card>
            <v-card variant="outlined" class="mt-10">
              <v-card-title class="text-left">Words:</v-card-title>
              <v-card-subtitle class="text-left">Words to be learned</v-card-subtitle>
              <v-table>
                <thead>
                <tr>
                  <th class="text-left">
                    Word
                  </th>
                  <th class="text-left">
                    Translation
                  </th>
                  <th class="text-left">
                    Sentence
                  </th>
                </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in this.clicked" :key="i">
                    <td>{{ item[0] }}</td>
                    <td>{{ item[1] }}</td>
                    <td>{{ item[2] }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-row></div>



        </v-sheet>
      </v-container>
    </v-main>

  </v-app>


</template>

<style scoped>

.middle {
  width: 100ch;
  max-width: 100%;
}

.click:hover {
  background-color: yellow;
  cursor: pointer;
}
</style>
