<script setup>
import {
  affil,
  dates,
  memo, one,
  taskMemo,
  taskTime,
  taskTitle,
  timelineKey,
  timelineValue, tomorrow,
  useMemo, useOne, useTask, useTomorrow, useWrong, wrongFeedback, wrongTitle
} from "../../reactions.js";
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

    const dateArr = dates.value.split("-");
    const time = new Date(dates.value + " 12:00:00");
    const day = ["일", "월", "화", "수", "목", "금", "토"][time.getDay()];

    const title = `${affil.value} 훈련일지`;
    const dateText = `${dateArr[0]}년 ${dateArr[1]}월 ${dateArr[2]}일 (${day})`;

    const rows = [];
    timelineValue.value.forEach((v, i) => {
      const keys = timelineKey.value[i];
      rows.push({
        time: keys.map((va) => `${va.start.join(":")} ~ ${va.end.join(":")}`),
        content: v,
      });
    });

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const res = await fetch(fontFile);
    const buffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);

    doc.addFileToVFS("NotoSansKR.ttf", base64);
    doc.addFont("NotoSansKR.ttf", "NotoSansKR", "normal");
    doc.setFont("NotoSansKR");

    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const LEFT = 14;
    const RIGHT = 14;
    const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
    const BOTTOM_MARGIN = 14;

    const normalStyle = {
      font: "NotoSansKR",
      fontStyle: "normal",
      fontSize: 12,
      cellPadding: 3,
      lineColor: [153, 153, 153],
      lineWidth: 0.2,
      overflow: "linebreak",
      textColor: [0, 0, 0],
      valign: "middle",
    };

    const headStyle = {
      font: "NotoSansKR",
      fontStyle: "normal",
      halign: "center",
      valign: "middle",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [153, 153, 153],
      lineWidth: 0.2,
    };

    function drawSectionTitle(text, y) {
      doc.setFont("NotoSansKR");
      doc.setFontSize(16);
      doc.text(text, LEFT, y);
    }

    function getLastTableState() {
      if (!doc.lastAutoTable) {
        return {
          pageNumber: doc.getNumberOfPages(),
          finalY: 45,
        };
      }

      return {
        pageNumber: doc.lastAutoTable.pageNumber,
        finalY: doc.lastAutoTable.finalY,
      };
    }

    function prepareSection(minHeight = 30) {
      let { pageNumber, finalY } = getLastTableState();

      // 마지막 autoTable이 끝난 페이지로 강제로 이동
      doc.setPage(pageNumber);

      // 현재 페이지에서 공간 부족하면 새 페이지 추가
      if (finalY + minHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
        doc.addPage();
        pageNumber = doc.getNumberOfPages();
        doc.setPage(pageNumber);
        finalY = 20;
      }

      return finalY;
    }

    /* =======================
        제목
    ======================= */
    doc.setFontSize(22);
    doc.text(title, LEFT, 20);

    doc.setFontSize(14);
    doc.text(dateText, LEFT, 30);

    doc.setFontSize(16);
    doc.text("훈련 시간표", LEFT, 45);

    /* =======================
        훈련 시간표
    ======================= */
    const logBody = [];

    rows.forEach((r) => {
      r.time.forEach((t, i) => {
        logBody.push([
          t,
          i === 0 ? r.content : "",
        ]);
      });
    });

    autoTable(doc, {
      startY: 50,
      head: [["시간", "내용"]],
      body: logBody,
      styles: normalStyle,
      headStyles: headStyle,
      columnStyles: {
        0: { cellWidth: CONTENT_WIDTH * 0.2, halign: "center" },
        1: { cellWidth: CONTENT_WIDTH * 0.8 },
      },
      didParseCell(data) {
        if (data.section !== "body") return;

        data.cell.styles.font = "NotoSansKR";
        data.cell.styles.fontStyle = "normal";

        if (data.column.index === 1 && data.cell.raw === "") {
          data.cell.styles.lineWidth = {
            top: 0,
            right: 0.2,
            bottom: 0.2,
            left: 0.2,
          };
        }
      },
    });

    let cursorY = doc.lastAutoTable.finalY;

    /* =======================
        메모
    ======================= */
    if (useMemo.value) {
      cursorY = prepareSection(30);

      drawSectionTitle("메모", cursorY + 15);

      autoTable(doc, {
        startY: cursorY + 20,
        body: [[memo.value || ""]],
        styles: normalStyle,
        columnStyles: {
          0: { cellWidth: CONTENT_WIDTH },
        },
      });

      cursorY = doc.lastAutoTable.finalY;
    }

    /* =======================
        과제 풀이
    ======================= */
    if (useTask.value) {
      cursorY = prepareSection(30);

      drawSectionTitle("과제 풀이", cursorY + 15);

      const taskBody = taskMemo.value.map((v, i) => [
        String(taskTime.value[i] ?? ""),
        taskTitle.value[i] ?? "",
        v ?? "",
      ]);

      autoTable(doc, {
        startY: cursorY + 20,
        head: [["풀이 시간", "과제 제목", "과제 메모"]],
        body: taskBody,
        styles: normalStyle,
        headStyles: headStyle,
        columnStyles: {
          0: { cellWidth: CONTENT_WIDTH * (1 / 6), halign: "center" },
          1: { cellWidth: CONTENT_WIDTH * (2 / 6) },
          2: { cellWidth: CONTENT_WIDTH * (3 / 6) },
        },
        didParseCell(data) {
          data.cell.styles.font = "NotoSansKR";
          data.cell.styles.fontStyle = "normal";
        },
      });

      cursorY = doc.lastAutoTable.finalY;
    }

    /* =======================
        오답 노트
    ======================= */
    if (useWrong.value) {
      cursorY = prepareSection(30);

      drawSectionTitle("오답 노트", cursorY + 15);

      const wrongBody = wrongTitle.value.map((v, i) => [
        v ?? "",
        wrongFeedback.value[i] ?? "",
      ]);

      autoTable(doc, {
        startY: cursorY + 20,
        head: [["틀림 / 아쉬움", "해결방안 / 계획"]],
        body: wrongBody,
        styles: normalStyle,
        headStyles: headStyle,
        columnStyles: {
          0: { cellWidth: CONTENT_WIDTH * 0.2 },
          1: { cellWidth: CONTENT_WIDTH * 0.8 },
        },
        didParseCell(data) {
          data.cell.styles.font = "NotoSansKR";
          data.cell.styles.fontStyle = "normal";
        },
      });

      cursorY = doc.lastAutoTable.finalY;
    }

    /* =======================
        내일 할 일
    ======================= */
    if (useTomorrow.value) {
      cursorY = prepareSection(30);

      drawSectionTitle("내일 할 일", cursorY + 15);

      const tomorrowBody = tomorrow.value.map((v, i) => [
        String(i + 1),
        v ?? "",
      ]);

      autoTable(doc, {
        startY: cursorY + 20,
        head: [["번호", "할 일"]],
        body: tomorrowBody,
        styles: normalStyle,
        headStyles: headStyle,
        columnStyles: {
          0: { cellWidth: CONTENT_WIDTH * 0.1, halign: "center" },
          1: { cellWidth: CONTENT_WIDTH * 0.9 },
        },
        didParseCell(data) {
          data.cell.styles.font = "NotoSansKR";
          data.cell.styles.fontStyle = "normal";
        },
      });

      cursorY = doc.lastAutoTable.finalY;
    }

    /* =======================
        한 줄 요약
    ======================= */
    if (useOne.value) {
      cursorY = prepareSection(30);

      drawSectionTitle("한 줄 요약", cursorY + 15);

      autoTable(doc, {
        startY: cursorY + 20,
        body: [[one.value || ""]],
        styles: normalStyle,
        columnStyles: {
          0: { cellWidth: CONTENT_WIDTH },
        },
        didParseCell(data) {
          data.cell.styles.font = "NotoSansKR";
          data.cell.styles.fontStyle = "normal";
        },
      });

      cursorY = doc.lastAutoTable.finalY;
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
    let taskCells = [];
    let wrongCells = [];
    let tomorrowCells = [];

    rows.forEach((r) => {
      logCells.push(...r.time.map((v, i) => {
        return new TableRow({
          children: [dataCell(v, {}, { size: 20, type: WidthType.PERCENTAGE }), dataCell(!i ? r.content : "", {
            verticalMerge: !i ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE
          }, { size: 80, type: WidthType.PERCENTAGE })],
        })
      }));
    });

    taskCells.push(...taskMemo.value.map((v, i) => {
      return new TableRow({
        children: [
          dataCell(String(taskTime.value[i]), {}, { size: 100 / 6, type: WidthType.PERCENTAGE }),
          dataCell(taskTitle.value[i], {}, { size: 100 / 6 * 2, type: WidthType.PERCENTAGE }),
          dataCell(v, {}, { size: 100 / 6 * 3, type: WidthType.PERCENTAGE })],
      })
    }));

    wrongCells.push(...wrongTitle.value.map((v, i) => {
      return new TableRow({
        children: [
          dataCell(v, {}, { size: 20, type: WidthType.PERCENTAGE }),
          dataCell(wrongFeedback.value[i], {}, { size: 80, type: WidthType.PERCENTAGE })
      ]})
    }));

    tomorrowCells.push(...tomorrow.value.map((v, i) => {
      return new TableRow({
        children: [
          dataCell(String(i + 1), {}, { size: 10, type: WidthType.PERCENTAGE }),
          dataCell(v, {}, { size: 90, type: WidthType.PERCENTAGE })
      ]})
    }));

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
    });

    const taskTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
            children: [headerCell("풀이 시간", { size: 100 / 6, type: WidthType.PERCENTAGE }), headerCell("과제 제목", { size: 100 / 6 * 2, type: WidthType.PERCENTAGE }), headerCell("과제 메모", { size: 100 / 6 * 3, type: WidthType.PERCENTAGE })],
          }),

          ...taskCells
      ],
    });

    const wrongTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
            children: [headerCell("틀림 / 아쉬움", { size: 20, type: WidthType.PERCENTAGE }), headerCell("해결방안 / 계획", { size: 80, type: WidthType.PERCENTAGE })],
          }),

          ...wrongCells
      ],
    });

    const tomorrowTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
            children: [headerCell("번호", { size: 10, type: WidthType.PERCENTAGE }), headerCell("할 일", { size: 90, type: WidthType.PERCENTAGE })],
          }),

          ...tomorrowCells
      ],
    });

    const oneTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [dataCell(one.value, { size: 100, type: WidthType.PERCENTAGE },)],
        })
      ],
    });

    let memoSection = [];
    let taskSection = [];
    let wrongSection = [];
    let tomorrowSection = [];
    let oneSection = [];

    if (useMemo.value) {
      memoSection = [
        new Paragraph({
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "메모", bold: true, size: 24, font: "Malgun Gothic" })],
        }),
        memoTable
      ];
    }

    if (useTask.value) {
      taskSection = [
        new Paragraph({
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "과제 풀이", bold: true, size: 24, font: "Malgun Gothic" })],
        }),
        taskTable
      ];
    }

    if (useWrong.value) {
      wrongSection = [
        new Paragraph({
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "오답 노트", bold: true, size: 24, font: "Malgun Gothic" })],
        }),
        wrongTable
      ];
    }

    if (useTomorrow.value) {
      tomorrowSection = [
        new Paragraph({
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "내일 할 일", bold: true, size: 24, font: "Malgun Gothic" })],
        }),
        tomorrowTable
      ];
    }

    if (useOne.value) {
      oneSection = [
        new Paragraph({
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "한 줄 요약", bold: true, size: 24, font: "Malgun Gothic" })],
        }),
        oneTable
      ];
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
            ...memoSection,
            ...taskSection,
            ...wrongSection,
            ...tomorrowSection,
            ...oneSection,
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

      useTask: useTask.value,
      taskMemo: taskMemo.value,
      taskTitle: taskTitle.value,
      taskTime: taskTime.value,

      useWrong: useWrong.value,
      wrongFeedback: wrongFeedback.value,
      wrongTitle: wrongTitle.value,

      useTomorrow: useTomorrow.value,
      tomorrow: tomorrow.value,

      useOne: useOne.value,
      one: one.value,
    }

    localStorage['trainingLogData'] = JSON.stringify(data);

    alert("현재 작성하고 계신 내용이 임시저장 되었습니다!");
  }
</script>

<template>
  <h1 class="title">{{ affil }} 훈련일지 작성</h1>

  <section class="top flex jcs gap aic">
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
  </section>
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