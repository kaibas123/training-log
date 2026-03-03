<script setup>
import {affil, dates, timelineKey, timelineValue} from "../../reactions.js";
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
  } from "docx";
  import { saveAs } from "file-saver";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import fontFile from "@/assets/NotoSansKR.ttf?url";

async function makeTrainingPdf() {
  if (affil.value === "") return alert("직종을 선택 해주세요.");
  if (dates.value === "") return alert("날짜를 선택 해주세요.");

  let dateArr = dates.value.split("-");
  let time = new Date(dates.value + " 12:00:00");
  let day = ["일", "월", "화", "수", "목", "금", "토"][time.getDay()];

  let title = `${affil.value} 훈련일지`;
  let dateText = `${dateArr[0]}년 ${dateArr[1]}월 ${dateArr[2]}일 (${day})`;

  let rows = [];

  timelineValue.value.forEach((v, i) => {
    let now = timelineKey.value[i];
    rows.push([
      `${now.start.join(":")} ~ ${now.end.join(":")}`,
      v
    ]);
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const font = await fetch(fontFile).then(res => res.arrayBuffer());

  doc.addFileToVFS("NotoSansKR.ttf", font);
  doc.addFont("NotoSansKR.ttf", "NotoSansKR", "normal");
  doc.setFont("NotoSansKR");

  doc.setFontSize(18);
  doc.text(title, 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(dateText, 105, 30, { align: "center" });

  doc.setFontSize(14);
  doc.text("훈련 시간표", 14, 45);

  autoTable(doc, {
    startY: 50,
    head: [["시간", "내용"]],
    body: rows,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { cellWidth: 35 },  // 시간칸 좁게
      1: { cellWidth: 140 }, // 내용칸 넓게
    },
  });

  doc.save(`${dates.value.replaceAll("-", "_")}_훈련일지.pdf`);
}

  async function makeTrainingDocx() {
    if (affil.value === "") return alert("직종을 선택 해주세요.");
    if (dates.value === "") return alert("날짜를 선택 해주세요.");

    let dateArr = dates.value.split("-");
    let time = new Date(dates.value + " 12:00:00");
    let day = ["일", "월", "화", "수", "목", "금", "토"][time.getDay()];

    let title = `${affil.value} 훈련일지`;
    let dateText = `${dateArr[0]}년 ${dateArr[1]}월 ${dateArr[2]}일 (${day})`;
    let rows = [];

    timelineValue.value.forEach((v, i) => {
      let now = timelineKey.value[i];
      rows.push({ time: `${now.start.join(":")} ~ ${now.end.join(":")}`, content: v });
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

    const dataCell = (text, nowWidth, shadeHex = "FFFFFF") =>
        new TableCell({
          width: nowWidth,
          borders,
          margins,
          shading: { type: ShadingType.CLEAR, color: "auto", fill: shadeHex },
          children: [new Paragraph({
              children: [ new TextRun({ text, font: "Malgun Gothic", size: 22, }) ]
            })
          ]
        });

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // 헤더(시간/내용)
        new TableRow({
          children: [headerCell("시간", { size: 20, type: WidthType.PERCENTAGE },), headerCell("내용", { size: 80, type: WidthType.PERCENTAGE },)],
        }),

        // 데이터 행들 (스샷처럼 연한 파란색)
        ...rows.map((r) =>
            new TableRow({
              children: [dataCell(r.time, { size: 20, type: WidthType.PERCENTAGE },), dataCell(r.content, { size: 80, type: WidthType.PERCENTAGE },)],
            })
        ),
      ],
    });

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
            table,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${dates.value.replaceAll("-", "_")}_훈련일지.docx`);
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

    <button class="btn btn-primary" @click="makeTrainingDocx()">Word 다운로드</button>
    <button class="btn btn-primary" @click="makeTrainingPdf()">PDF 다운로드</button>
  </div>
</template>

<style scoped>

</style>