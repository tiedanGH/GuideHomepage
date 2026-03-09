// 角色数据文件 - rolesData.js

const townsfolkRoles = [
    {
        "id": "washerwomanCustomVER",
        "name": "洗衣妇",
        "team": "townsfolk",
        "firstNight": 1,
        "firstNightReminder": "选择一名玩家，得知他是洗衣妇或图书管理员或调查员中的一个。",
        "otherNight": 0,
        "otherNightReminder": "",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image1/11_image1.png",
        "ability": "首夜，选择一名玩家：你会得知他是洗衣妇、图书管理员或调查员中的一个。",
        "setup": "",
        "reminders": [],
        "bluffs": ["厨师", "图书管理员", "调查员", "管家", "隐士", "侍臣", "艺术家", "数学家", "僧侣", "军人", "预言家", "学者", "送葬者", "调查员"]
    },
    {
        "id": "librarianCustomVER",
        "name": "图书管理员",
        "team": "townsfolk",
        "firstNight": 2,
        "firstNightReminder": "选择一名玩家，得知他是图书管理员或洗衣妇或调查员中的一个。",
        "otherNight": 0,
        "otherNightReminder": "",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image1/12_image1.png",
        "ability": "首夜，选择一名玩家：你会得知他是图书管理员、洗衣妇或调查员中的一个。",
        "setup": "",
        "reminders": [],
        "bluffs": ["厨师", "洗衣妇", "调查员", "管家", "隐士", "侍臣", "艺术家", "数学家", "僧侣", "军人", "预言家", "学者", "送葬者"]
    },
    {
        "id": "investigatorCustomVER",
        "name": "调查员",
        "team": "townsfolk",
        "firstNight": 3,
        "firstNightReminder": "选择一名玩家，得知他是调查员或洗衣妇或图书管理员中的一个。",
        "otherNight": 0,
        "otherNightReminder": "",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image1/13_image1.png",
        "ability": "首夜，选择一名玩家：你会得知他是调查员、洗衣妇或图书管理员中的一个。",
        "setup": "",
        "reminders": [],
        "bluffs": ["厨师", "洗衣妇", "图书管理员", "管家", "隐士", "侍臣", "艺术家", "数学家", "僧侣", "军人", "预言家", "学者", "送葬者"]
    },
    {
        "id": "chefCustomVER",
        "name": "厨师",
        "team": "townsfolk",
        "firstNight": 4,
        "firstNightReminder": "得知有多少对邪恶角色相邻。",
        "otherNight": 0,
        "otherNightReminder": "",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image1/14_image1.png",
        "ability": "首夜，你会得知本局游戏中中有多少对邪恶角色是相邻的。",
        "setup": "",
        "reminders": [],
        "bluffs": ["洗衣妇", "图书管理员", "调查员", "管家", "隐士", "侍臣", "艺术家", "数学家", "僧侣", "军人", "预言家", "学者", "送葬者"]
    }
];

const outsidersRoles = [
    {
        "id": "butlerCustomVER",
        "name": "管家",
        "team": "outsider",
        "firstNight": 5,
        "firstNightReminder": "选择一名玩家，本局游戏中你所有的提名都必须得到他的同意才能进行。",
        "otherNight": 0,
        "otherNightReminder": "",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image1/15_image1.png",
        "ability": "首夜，选择一名玩家：本局游戏中，你所有的提名都必须得到他的同意才能进行。",
        "setup": "",
        "reminders": [],
        "bluffs": ["洗衣妇", "图书管理员", "调查员", "厨师", "隐士", "侍臣", "艺术家", "数学家", "僧侣", "军人", "预言家", "学者", "送葬者"]
    }
];

const minionsRoles = [
    {
        "id": "poisonerCustomVER",
        "name": "投毒者",
        "team": "minion",
        "firstNight": 100,
        "firstNightReminder": "选择一名玩家，他会被毒死。",
        "otherNight": 100,
        "otherNightReminder": "选择一名玩家，他会被毒死。",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image2/1_image2.png",
        "ability": "每个夜晚，选择一名玩家：他会被毒死。",
        "setup": "",
        "reminders": ["投毒"],
        "bluffs": ["洗衣妇", "图书管理员", "调查员", "厨师", "管家", "隐士", "侍臣", "艺术家", "数学家", "僧侣", "军人", "预言家", "学者", "送葬者"]
    }
];

const demonsRoles = [
    {
        "id": "impCustomVER",
        "name": "小恶魔",
        "team": "demon",
        "firstNight": 200,
        "firstNightReminder": "选择一名玩家，他会死亡。",
        "otherNight": 200,
        "otherNightReminder": "选择一名玩家，他会死亡。",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image3/1_image3.png",
        "ability": "每个夜晚，选择一名玩家：他会死亡。",
        "setup": "",
        "reminders": ["杀人"],
        "bluffs": ["洗衣妇", "图书管理员", "调查员", "厨师", "管家", "隐士", "侍臣", "艺术家", "数学家", "僧侣", "军人", "预言家", "学者", "送葬者"]
    }
];

const fabledRoles = [
    {
        "id": "doomsayerCustomVER",
        "name": "末日预言家",
        "team": "fabled",
        "firstNight": 0,
        "firstNightReminder": "",
        "otherNight": 0,
        "otherNightReminder": "",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image5/1_image5.png",
        "ability": "如果本局游戏中有3名或更多的外来者，善良阵营无法获胜。",
        "setup": "",
        "reminders": [],
        "bluffs": []
    }
];

const travellersRoles = [
    {
        "id": "saintTravellerCustomVER",
        "name": "圣人(旅行者)",
        "team": "traveller",
        "firstNight": 0,
        "firstNightReminder": "",
        "otherNight": 0,
        "otherNightReminder": "",
        "image": "https://www.bloodstar.xyz/p/Haimian0421/image6/1_image6.png",
        "ability": "如果你被处决，邪恶阵营获胜。",
        "setup": "",
        "reminders": [],
        "bluffs": []
    }
];

// 导出所有角色数据
const allRoles = [...townsfolkRoles, ...outsidersRoles, ...minionsRoles, ...demonsRoles, ...fabledRoles, ...travellersRoles];