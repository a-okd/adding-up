'use strict';
// fs(File System) モジュールを読み込んで使えるようにする
const fs = require('fs');
// readline モジュールを読み込んで使えるようにする
const readline = require('readline');
// popu-pref.csv をファイルとして読み込める状態に準備する
const rs = fs.createReadStream('./popu-pref.csv');
// readline モジュールに rs を設定する
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
// popu-pref.csv のデータを1行ずつ読み込んで、設定された関数を実行する
rl.on('line', lineString => {
    // ["2010", "北海道", "237155", "258530"] のようなデータ配列に分割
    const columns = lineString.split(',');
    const year = parseInt(columns[0]); // 年
    const prefecture = columns[1]; // 都道府県名
    const popu = parseInt(columns[3]); // 15~19歳の人口
    if (year === 2010 || year === 2015) {
        let def = { popu10: 0, popu15: 0, change: null};
        // 都道府県ごとのデータを作る。データがなかったらデータを初期化。
        let value = prefectureDataMap.get(prefecture) || def;
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
rl.on('close', () => {
    // 全データをループして変化率を計算
    for (let [key, data] of prefectureDataMap) {
        data.change = data.popu15 / data.popu10;
    }
    // 並べ替えを行う（難しすぎるので覚えなくてOK）
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        // 引き算の結果、マイナスなら降順、プラスなら昇順に入れ替え
        return pair2[1].change - pair1[1].change;
    });
    // データを整形
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
            key +
            ': ' +
            value.popu10 +
            '人=>' +
            value.popu15 +
            '人 変化率:' +
            value.change
        );
    });
    console.log(rankingStrings);
});