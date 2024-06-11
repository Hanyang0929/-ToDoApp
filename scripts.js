let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTaskIndex = null;

function showTaskForm() {
  resetTaskForm(); // タスク追加フォームをリセット
  const taskForm = document.getElementById("taskForm");
  taskForm.style.display = "block";
  document.getElementById("taskForm-button").style.display = "none";
}

function addTask() {
  const taskDescription = document.getElementById("taskDescription").value;
  const priority = document.getElementById("prioritySelect").value;
  const deadline = document.getElementById("deadlineDate").value;

  ////////////タスクの入力がきちんとされているかの通知/////////////
  const bar = document.getElementById("task_snackbar");
  bar.className = "task_notification";
  setTimeout(function () {
    bar.className = bar.className.replace("task_notification", "");
  }, 3000);

  const taskAlert_text = [
    "タスク内容を入力してください",
    "期限日を入力してください",
    "タスク内容と期限日を入力してください",
  ];

  if (!taskDescription && !deadline) {
    bar.innerHTML = `
    <p class="taskAlert">${taskAlert_text[2]}</p>
    `;
    return;
  } else if (taskDescription && !deadline) {
    bar.innerHTML = `
    <p class="taskAlert">${taskAlert_text[1]}</p>
  `;
    return;
  } else if (!taskDescription && deadline) {
    bar.innerHTML = `
    <p class="taskAlert">${taskAlert_text[0]}</p>
  `;
    return;
  }
  /////////////////////////////////////////////////////////////////

  const task = {
    description: taskDescription,
    priority: priority === "high" ? "高" : "低",
    deadline: formatDate(deadline), // 日付のフォーマットを変更
    memo: "",
    completed: false,
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存
  document.getElementById("taskForm").style.display = "none";
  document.getElementById("taskForm-button").style.display = "block";
  bar.classList.add("hidden");
  displayTasks();
}

/////////////////期限前日と今日のタスク赤くする///////////

function displayNearTask(row, deadline) {
  const today = new Date(); //iso8601形式
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const taskDeadline = new Date(deadline); //iso8601形式
  if (
    taskDeadline.toDateString() == today.toDateString() ||
    taskDeadline.toDateString() == tomorrow.toDateString()
  ) {
    row.classList.add("deadlineAlert");
  } else {
    row.classList.remove("deadlineAlert");
  }
}
//////////////////////////////////////////////////////////////

function displayTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    if (!task.completed) {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${task.deadline}</td>
            <td>${task.priority}</td>
            <td>${task.description}</td>
            <td>
            <div class="hamburger-container">
              <div class="hamburger-menu">
                <div class="hamburger-icon" id="hamburger-icon-${index}" onclick="toggleMenu(${index})">
                  <span class="line"></span>
                  <span class="line"></span>
                  <span class="line"></span>
                </div>
                <!-- ハンバーガーメニュー -->
                <div class="menu-items" id="menu-items-${index}">
                  <button class="menu-button-1" onclick="editTask(${index})">編集</button>
                  <button class="menu-button-2" onclick="completeTask(${index})">完了</button>
                  <button class="menu-button-3" onclick="memoTask(${index})">メモ</button>
                  <div id="memoFormContainer-${index}" class="hidden">
                    <textarea class="memoText" id="memoText-${index}" placeholder="メモを入力してください"></textarea>
                    <button class="menu-button-4" onclick="saveMemo(${index})">保存</button>
                  </div>
                  <button class="menu-button-5" onclick="deleteTask(${index})" class="deleteTask-button">削除</button>
                </div>
              </div>
            </div>
            </td>
    `;
      taskList.appendChild(row);
      displayNearTask(row, task.deadline);
    }
  });
}

function showCompletedTask() {
  displayCompletedTasks();
}

////////////////////////ハンバーガーメニュー////////////////////////////////////
function toggleMenu(index) {
  const menuItems = document.getElementById(`menu-items-${index}`);
  const hamburgerIcon = document.getElementById(`hamburger-icon-${index}`);

  const allMenus = document.querySelectorAll(".menu-items"); //クラスがmenu-itemsのクラスを全部取得

  allMenus.forEach((menu) => {
    if (menu.id !== `menu-items-${index}` && menu.style.display !== "none") {
      menu.style.display = "none";
      // 他のハンバーガーメニュークリックしたら閉じる
      const menuIndex = menu.id.split("-").pop();
      document
        .getElementById(`hamburger-icon-${menuIndex}`)
        .classList.remove("open");
    }
  });

  // メニューの表示状態を切り替える
  if (menuItems.style.display === "none") {
    menuItems.style.display = "block";
    hamburgerIcon.classList.add("open"); // アイコン開く

    if (tasks[index].memo !== "") {
      //メモが""ではない時、最初からメモフォームを表示する(ユーザの手間省き)
      memoTask(index);
    }
  } else {
    menuItems.style.display = "none";
    hamburgerIcon.classList.remove("open"); // アイコン閉じる
  }
}

function sortByPriority() {
  const priorityWithIndex = tasks.map((task, index) => ({
    index: index,
    priority: task.priority === "高" ? 1 : 2,
  }));

  const sortedPriorities = sortMinMax(
    priorityWithIndex.map((item) => item.priority)
  );

  const sortedPriorityWithIndex = sortedPriorities.map((priority) => {
    const item = priorityWithIndex.find(
      (item) => item.priority == priority && !item.sorted
    );
    item.sorted = true;
    return item;
  });

  const sortedTasks = sortedPriorityWithIndex.map((item) => tasks[item.index]);

  tasks = sortedTasks;
  localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存
  displayTasks();
}

function sortByDeadline() {
  const deadlineWithIndex = tasks.map((task, index) => ({
    index: index,
    deadline: new Date(task.deadline).getTime(),
  }));

  const sortedDeadlines = sortMinMax(
    deadlineWithIndex.map((item) => item.deadline)
  );

  const sortedDeadlinesWithIndex = sortedDeadlines.map((deadline) => {
    const item = deadlineWithIndex.find(
      (item) => item.deadline == deadline && !item.sorted
    );
    item.sorted = true;
    return item;
  });
  const sortedTasks = sortedDeadlinesWithIndex.map((item) => tasks[item.index]);

  tasks = sortedTasks;
  localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存
  displayTasks();
}

//////// /////////////////////ソート関数//////////////////////////////////
function sortMinMax(arr) {
  let newMinArray = [];
  let newMaxArray = [];

  while (arr.length > 0) {
    let minValue = Math.min(...arr);
    let minOccurrences = arr.filter((value) => value == minValue).length;
    for (let i = 0; i < minOccurrences; i++) {
      newMinArray.push(minValue);
    }
    arr = arr.filter((value) => value !== minValue); //最小値をarrから取り除いた

    if (arr.length > 0) {
      // 配列がまだ空か

      let maxValue = Math.max(...arr);
      let maxOccurrences = arr.filter((value) => value == maxValue).length;
      for (let i = 0; i < maxOccurrences; i++) {
        newMaxArray.unshift(maxValue);
      }
      arr = arr.filter((value) => value !== maxValue); //最大値をarrから取り除いた
    }
  }

  return newMinArray.concat(newMaxArray); //ソート後の配列
}

/////////////////タスク完了＋confirm//////////////////////////////////////
function completeTask(index) {
  const bar = document.getElementById("confirm_snackbar");
  bar.classList.add("visible");
  bar.classList.remove("un_visible");

  document.getElementById("complete_yes").onclick = function () {
    const bar = document.getElementById("confirm_snackbar");
    tasks[index].completed = true;

    localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存

    displayTasks();
    textAnimation();
    cheerAnimation();
    complete_notification();
    bar.classList.add("un_visible");
    bar.classList.remove("visible");
  };
  document.getElementById("complete_no").onclick = function () {
    const bar = document.getElementById("confirm_snackbar");
    bar.classList.add("un_visible");
    bar.classList.remove("visible");
  };
}

function displayCompletedTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    if (task.completed) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${task.deadline}</td>
        <td>${task.priority}</td>
        <td>${task.description}</td>
        <td>
          <button type="button" onclick="deleteCompleteTask(${index})" style="height: 50px;" class="garbage-button">
            <img src="todo_garbage.png" class="garbageIcon">
          </button>
        </td> 
    `;
      taskList.appendChild(row);
    }
  });
}
////////////////////////////////////////////////////////////////////////////////

function deleteCompleteTask(index) {
  /////////タスクを削除する処理///////confirm/////////
  const bar = document.getElementById("delete_snackbar");
  bar.classList.add("visible");
  bar.classList.remove("un_visible");

  document.getElementById("delete_yes").onclick = function () {
    const bar = document.getElementById("delete_snackbar");
    bar.classList.add("un_visible");
    bar.classList.remove("visible");
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存
    displayCompletedTasks();
  };

  document.getElementById("delete_no").onclick = function () {
    const bar = document.getElementById("delete_snackbar");
    bar.classList.add("un_visible");
    bar.classList.remove("visible");
  };
}

function deleteTask(index) {
  const bar = document.getElementById("delete_snackbar");
  bar.classList.add("visible");
  bar.classList.remove("un_visible");

  document.getElementById("delete_yes").onclick = function () {
    const bar = document.getElementById("delete_snackbar");
    bar.classList.add("un_visible");
    bar.classList.remove("visible");
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存
    displayTasks();
  };

  document.getElementById("delete_no").onclick = function () {
    const bar = document.getElementById("delete_snackbar");
    bar.classList.add("un_visible");
    bar.classList.remove("visible");
  };
}

//////////////////////////////編集機能///////////////////////////////
function editTask(index) {
  currentTaskIndex = index;
  const editContainer = document.getElementById("edit-container");
  const editTaskDescription = document.getElementById("edit-taskDescription");
  const editPriority = document.getElementById("edit-prioritySelect");
  const editDeadline = document.getElementById("edit-deadlineDate");
  editTaskDescription.value = tasks[index].description;
  editPriority.value = tasks[index].priority === "高" ? "high" : "low";

  //編集フォームにタスクの日付を反映させるためにもとに戻す
  const [year, month, day] = tasks[index].deadline.split("/");
  editDeadline.value = `${year}-${month}-${day}`;
  editContainer.classList.remove("edit-hidden");
  document.getElementById("taskForm-button").style.display = "none"; //編集ボタン押したときにタスクを追加ボタンがなくなる。ユーザがさわらないように
  document.getElementById("taskForm").style.display = "none"; //編集ボタン押したときに新規のタスクの追加フォームを閉じる
}

function updateTask() {
  //const editTaskDescription = document.getElementById("edit-taskDescription");
  //const editPriority = document.getElementById("edit-prioritySelect");
  //const editDeadline = document.getElementById("edit-deadlineDate");

  const updateTaskDescription = document
    .getElementById("edit-taskDescription")
    .value.trim();
  const updatePriority = document.getElementById("edit-prioritySelect").value;
  const updateDeadline = document.getElementById("edit-deadlineDate").value;

  if (!updateTaskDescription || !updateDeadline) {
    alert("タスク内容と期限を入力してください");
    return;
  }

  tasks[currentTaskIndex] = {
    ...tasks[currentTaskIndex],

    description: updateTaskDescription,
    priority: updatePriority === "high" ? "高" : "低",
    deadline: formatDate(updateDeadline),
  };

  const editContainer = document.getElementById("edit-container");
  editContainer.classList.add("edit-hidden");
  currentTaskIndex = null;

  localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存
  document.getElementById("taskForm-button").style.display = "block"; //displayTask()の後に実行するとタスクを追加ボタンが動かにゃい
  displayTasks();
}
///////////////////////////////////////////////////////////////////////

function memoTask(index) {
  //メモ機能
  const memoFormContainer = document.getElementById(
    `memoFormContainer-${index}`
  );

  document.getElementById(`memoText-${index}`).value = tasks[index].memo;

  memoFormContainer.classList.remove("hidden");
}

//メモ保存
function saveMemo(index) {
  const memoText = document.getElementById(`memoText-${index}`).value;
  tasks[index].memo = memoText;
  localStorage.setItem("tasks", JSON.stringify(tasks)); // ローカルストレージに保存
  const memoFormContainer = document.getElementById(
    `memoFormContainer-${index}`
  );
  memoFormContainer.classList.add("hidden");
  memo_notification();
}

function formatDate(dateString) {
  //日付形式
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); //0~11を取得しているから
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function resetTaskForm() {
  document.getElementById("taskDescription").value = "";
  document.getElementById("prioritySelect").value = "high";
  document.getElementById("deadlineDate").value = "";
  document.getElementById("taskForm").style.display = "none";
}

// 初期表示時にタスクを表示
displayTasks();

//////////////時計別ファイル//////////////////

function cheerAnimation() {
  var duration = 15 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function () {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

function textAnimation() {
  const text = document.getElementById("text");
  const textWidth = text.offsetWidth;
  const containerWidth = text.parentElement.offsetWidth;
  const animationDuration = (textWidth / containerWidth) * 4.5;
  text.style.animationDuration = `${animationDuration}s`;

  // アニメーションをリセットするために無理やり削除
  text.classList.remove("animate");

  // 強制的に再描画
  void text.offsetWidth; //

  // アニメーションを追加
  text.classList.add("animate");
}

function complete_notification() {
  const bar = document.getElementById("complete_snackbar");
  bar.className = "complete_notification";
  setTimeout(function () {
    bar.className = bar.className.replace("complete_notification", "");
  }, 3000);
}

function memo_notification() {
  const bar = document.getElementById("memo_snackbar");
  bar.className = "memo_notification";
  setTimeout(function () {
    bar.className = bar.className.replace("memo_notification", "");
  }, 3000);
}

function task_notification() {
  const bar = document.getElementById("task_snackbar");
  bar.className = "task_notification";
  setTimeout(function () {
    bar.className = bar.className.replace("task_notification", "");
  }, 3000);

  const taskAlert_text = [
    "タスク内容を入力してください",
    "期限日を入力してください",
    "タスク内容と期限日を入力してください",
  ];

  if (!taskDescription && !deadline) {
    bar.innerHTML = `
    <p class="taskAlert">${taskAlert_text[2]}</p>
    `;
    return;
  } else if (taskDescription && !deadline) {
    bar.innerHTML = `
    <p class="taskAlert">${taskAlert_text[1]}</p>
  `;
    return;
  } else if (!taskDescription && deadline) {
    bar.innerHTML = `
    <p class="taskAlert">${taskAlert_text[0]}</p>
  `;
    return;
  }
}
