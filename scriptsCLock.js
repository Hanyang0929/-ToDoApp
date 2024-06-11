const clock = new Vue({
  el: "#clock",
  data: {
    date: "",
    time: "",
    week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  mounted: function () {
    let timerID = setInterval(this.updateTime, 1000);
  },
  methods: {
    updateTime: function () {
      //現在の日付・時刻を取得
      let current_date = new Date();

      // 現在の時刻
      this.time =
        this.zeroPadding(current_date.getHours(), 2) +
        ":" +
        this.zeroPadding(current_date.getMinutes(), 2) +
        ":" +
        this.zeroPadding(current_date.getSeconds(), 2);

      // 現在の年月日
      this.date =
        this.zeroPadding(current_date.getFullYear(), 4) +
        "/" +
        this.zeroPadding(current_date.getMonth() + 1, 2) +
        "/" +
        this.zeroPadding(current_date.getDate(), 2) +
        "/" +
        this.week[current_date.getDay()];
    },
    zeroPadding: function (num, len) {
      let zero = "";

      // 0の文字列を作成
      for (var i = 0; i < len; i++) {
        zero += "0";
      }

      // zeroの文字列と、数字を結合し、後ろ２文字を返す
      return (zero + num).slice(-len);
    },
  },
});
