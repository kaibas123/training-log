<script setup>
import {affil, dates, memo, timelineKey, timelineValue, useMemo} from "../../reactions.js";
  import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    ShadingType,
    VerticalMergeType,
  } from "docx";
  import { saveAs } from "file-saver";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import fontFile from "@/assets/NotoSansKR.ttf?url";
import {watch} from "vue";

  watch(affil, () => {
    localStorage['affil'] = affil.value;
  });

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function makeTrainingPdf() {
  if (affil.value === "") return alert("직종을 선택 해주세요.");
  if (dates.value === "") return alert("날짜를 선택 해주세요.");

  localStorage["trainingLogData"] = "";

  let dateArr = dates.value.split("-");
  let time = new Date(dates.value + " 12:00:00");
  let day = ["일", "월", "화", "수", "목", "금", "토"][time.getDay()];

  let title = `${affil.value} 훈련일지`;
  let dateText = `${dateArr[0]}년 ${dateArr[1]}월 ${dateArr[2]}일 (${day})`;
  let rows = [];

  timelineValue.value.forEach((v, i) => {
    let keys = timelineKey.value[i];
    rows.push({
      time: [...keys.map(va => `${va.start.join(":")} ~ ${va.end.join(":")}`)],
      content: v
    });
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const res = await fetch(fontFile);
  if (!res.ok) throw new Error("폰트 파일을 못 불러옴: " + res.status);

  const buffer = await res.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);

  doc.addFileToVFS("NotoSansKR.ttf", base64);
  doc.addFont("NotoSansKR.ttf", "NotoSansKR", "normal");
  doc.setFont("NotoSansKR");

  doc.setFontSize(22);
  doc.text(title, 14, 20);

  doc.setFontSize(14);
  doc.text(dateText, 14, 30);

  doc.setFontSize(16);
  doc.text("훈련 시간표", 14, 45);

  // docx 구조와 맞춘 PDF용 body
  // merge처럼 보이게 하기 위해 메타정보도 같이 넣음
  const logBody = [];
  rows.forEach((r) => {
    r.time.forEach((t, i) => {
      logBody.push([
        {
          content: t,
          _mergeInfo: {
            type: "time",
            first: i === 0,
            last: i === r.time.length - 1,
            single: r.time.length === 1
          }
        },
        {
          content: i === 0 ? (r.content ?? "").toString() : "",
          _mergeInfo: {
            type: "content",
            first: i === 0,
            last: i === r.time.length - 1,
            single: r.time.length === 1
          }
        }
      ]);
    });
  });

  autoTable(doc, {
    startY: 50,
    head: [["시간", "내용"]],
    body: logBody,
    styles: {
      font: "NotoSansKR",
      fontSize: 12,
      cellPadding: 3,
      valign: "top",
      lineColor: [153, 153, 153],
      lineWidth: 0.2,
      overflow: "linebreak",
      textColor: [0, 0, 0],
    },
    headStyles: {
      font: "NotoSansKR",
      fontStyle: "normal",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineColor: [153, 153, 153],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 35, halign: "center", valign: "middle" },
      1: { cellWidth: 140, valign: "top" },
    },
    didParseCell: function (data) {
      data.cell.styles.font = "NotoSansKR";
      data.cell.styles.fontStyle = "normal";

      if (data.section !== "body") return;

      const raw = data.cell.raw;
      const mergeInfo = raw?._mergeInfo;

      if (!mergeInfo) return;

      // 내용칸만 세로 병합처럼 보이게 처리
      if (data.column.index === 1) {
        if (mergeInfo.single) {
          data.cell.styles.lineWidth = {
            top: 0.2,
            right: 0.2,
            bottom: 0.2,
            left: 0.2,
          };
        } else if (mergeInfo.first) {
          data.cell.styles.lineWidth = {
            top: 0.2,
            right: 0.2,
            bottom: 0,
            left: 0.2,
          };
        } else if (mergeInfo.last) {
          data.cell.styles.lineWidth = {
            top: 0,
            right: 0.2,
            bottom: 0.2,
            left: 0.2,
          };
        } else {
          data.cell.styles.lineWidth = {
            top: 0,
            right: 0.2,
            bottom: 0,
            left: 0.2,
          };
        }
      }
    },
  });

  if (useMemo.value) {
    const afterTableY = doc.lastAutoTable?.finalY ?? 50;
    const memoTitleY = afterTableY + 12;

    doc.setFont("NotoSansKR");
    doc.setFontSize(16);
    doc.text("메모", 14, memoTitleY);

    autoTable(doc, {
      startY: memoTitleY + 5,
      body: [[(memo.value ?? "").toString()]],
      styles: {
        font: "NotoSansKR",
        fontSize: 12,
        cellPadding: 3,
        valign: "top",
        lineColor: [153, 153, 153],
        lineWidth: 0.2,
        overflow: "linebreak",
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 175, valign: "top" },
      },
      didParseCell: function (data) {
        data.cell.styles.font = "NotoSansKR";
        data.cell.styles.fontStyle = "normal";
      },
    });
  }

  doc.save(`${dates.value.replaceAll("-", "_")}_훈련일지.pdf`);
}

  async function makeTrainingDocx() {
    if (affil.value === "") return alert("직종을 선택 해주세요.");
    if (dates.value === "") return alert("날짜를 선택 해주세요.");

    localStorage['trainingLogData'] = "";

    let dateArr = dates.value.split("-");
    let time = new Date(dates.value + " 12:00:00");
    let day = ["일", "월", "화", "수", "목", "금", "토"][time.getDay()];

    let title = `${affil.value} 훈련일지`;
    let dateText = `${dateArr[0]}년 ${dateArr[1]}월 ${dateArr[2]}일 (${day})`;
    let rows = [];

    timelineValue.value.forEach((v, i) => {
      let keys = timelineKey.value[i];
      rows.push({ time: [...keys.map(va => `${va.start.join(":")} ~ ${va.end.join(":")}`)], content: v });
    });

    const margins = {
      top: 100,
      left: 200,
      right: 200,
      bottom: 100,
    };

    const borders = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    };

    const headerCell = (text, nowWidth) =>
        new TableCell({
          width: nowWidth,
          borders,
          margins,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text, bold: true, font: "Malgun Gothic", size: 22 })],
            }),
          ],
        });

    const dataCell = (text, span, nowWidth, shadeHex = "FFFFFF") => {
      const lines = text.split("\n");

      return new TableCell({
        width: nowWidth,
        ...span,
        borders,
        margins,
        shading: { type: ShadingType.CLEAR, color: "auto", fill: shadeHex },
        children: [
          new Paragraph({
            children: lines.map((line, i) =>
                new TextRun({
                  text: line,
                  font: "Malgun Gothic",
                  size: 22,
                  break: i === 0 ? 0 : 1
                })
            )
          })
        ]
      });
    };

    let logCells = [];

    rows.forEach((r) => {
      logCells.push(...r.time.map((v, i) => {
        return new TableRow({
          children: [dataCell(v, {}, { size: 20, type: WidthType.PERCENTAGE }), dataCell(!i ? r.content : "", {
            verticalMerge: !i ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE
          }, { size: 80, type: WidthType.PERCENTAGE })],
        })
      }));
    });

    const logTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [headerCell("시간", { size: 20, type: WidthType.PERCENTAGE }), headerCell("내용", { size: 80, type: WidthType.PERCENTAGE })],
        }),

        ...logCells,
      ],
    });

    const memoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
            children: [dataCell(memo.value, { size: 100, type: WidthType.PERCENTAGE },)],
          })
      ],
    })

    let memoSection = [];

    if (useMemo.value) {
      memoSection = [
        new Paragraph({
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "메모", bold: true, size: 24, font: "Malgun Gothic" })],
        }),
        memoTable
      ]
    }

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: title, bold: true, size: 36, font: "Malgun Gothic" })],
            }),
            new Paragraph({
              spacing: { after: 400, before: 50 },
              children: [new TextRun({ text: dateText, size: 24, font: "Malgun Gothic" })],
            }),
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [new TextRun({ text: "훈련 시간표", bold: true, size: 24, font: "Malgun Gothic" })],
            }),
            logTable,
            ...memoSection
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${dates.value.replaceAll("-", "_")}_훈련일지.docx`);
  }

  function saveData() {
    let data = {
      dates: dates.value,
      timelineValue: timelineValue.value,
      timelineKey: timelineKey.value,
      useMemo: useMemo.value,
      memo: memo.value,
    }

    localStorage['trainingLogData'] = JSON.stringify(data);

    alert("현재 작성하고 계신 내용이 임시저장 되었습니다!");
  }
</script>

<template>
  <h1>{{ affil }} 훈련일지 작성</h1>

  <div class="top flex jcs gap aic">
    <div class="form-floating">
      <select v-model="affil" id="affil" class="form-control">
        <option value="" hidden selected>직종을 선택 해주세요</option>
        <option value="웹 테크놀로지스">웹 테크놀로지스</option>
        <option value="사이버 보안">사이버 보안</option>
        <option value="클라우드 컴퓨팅">클라우드 컴퓨팅</option>
        <option value="소프트웨어 테스팅">소프트웨어 테스팅</option>
        <option value="정보 기술">정보 기술</option>
        <option value="모바일 앱 개발">모바일 앱 개발</option>
        <option value="IT 네트워크 시스템">IT 네트워크 시스템</option>
      </select>

      <label for="affil">직종</label>
    </div>

    <div class="form-floating">
      <input type="date" id="date" class="form-control" v-model="dates">
      <label for="date">날짜</label>
    </div>

    <button class="btn btn-success" @click="saveData()">임시저장</button>
    <button class="btn btn-primary" @click="makeTrainingDocx()">Word 다운로드</button>
    <button class="btn btn-secondary" @click="makeTrainingPdf()">PDF 다운로드</button>
  </div>
</template>

<style scoped>
  .btn {
    transition: opacity .3s;
    opacity: .5;
  }
  .btn:hover {
    opacity: 1;
  }
</style>