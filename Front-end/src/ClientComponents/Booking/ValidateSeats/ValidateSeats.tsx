import { useCallback } from "react";

// Chuyển đổi mã ghế ("A1") thành { row: 0, col: 1 }
const parseSeatCode = (seatCode: string) => {
    const [_, rowLetter, col] = seatCode.match(/([A-Z]+)(\d+)/) || [];
    const row = rowLetter.charCodeAt(0) - 65; // "A" -> 0, "B" -> 1
    return { row, col: parseInt(col, 10) };
};

const useIsolatedSeatChecker = () => {
    const checkIsolatedSeat = useCallback(
        (selectedSeats: string[], allSeats: any) => {
            // debugger;
            if (selectedSeats.length === 0) return false;

            const minCol = 1;

            // Lấy cột lớn nhất thực tế trong từng hàng
            const getMaxColOfRow = (row: number) => {
                const rowObj = allSeats[row];
                if (!rowObj) return 0;

                const cols = Object.keys(rowObj).map(Number);
                return cols.length ? Math.max(...cols) : 0;
            };

            // Kiểm tra ghế có bị chiếm hay không
            const isOccupied = (r: number, c: number) => {
                const rowObj = allSeats?.[r];
                const seat = rowObj?.[c];

                if (!rowObj || !seat) return false;

                return (
                    selectedSeats.includes(
                        `${String.fromCharCode(65 + r)}${c}`
                    ) ||
                    seat.isHeld ||
                    seat.status === "held" ||
                    seat.status === "Booked" ||
                    seat.adminStatus === "empty" ||
                    seat.adminStatus === "disabled"
                );
            };

            // Chuyển đổi mã ghế thành đối tượng { row, col }
            const parsedSeats = selectedSeats.map(parseSeatCode);

            // Sắp xếp lại theo hàng và cột
            parsedSeats.sort((a, b) => a.col - b.col);

            for (let i = 0; i < parsedSeats.length; i++) {
                const { row, col } = parsedSeats[i];
                const maxColInRow = getMaxColOfRow(row); // Lấy cột lớn nhất thực tế trong hàng đó

                // Kiểm tra ghế bên trái và phải
                const isAtLeftEdge = col === minCol;
                const isAtRightEdge = col === maxColInRow;

                const left1 = !isAtLeftEdge && isOccupied(row, col - 1);
                const left2 = col - 2 >= minCol && isOccupied(row, col - 2);

                const right1 = !isAtRightEdge && isOccupied(row, col + 1);
                const right2 =
                    col + 2 <= maxColInRow && isOccupied(row, col + 2);

                // A1 booked, A2 trống, A3 chọn => ghế lẻ
                if (!left1 && left2) return true;

                // Kiểm tra đặc biệt cho ghế cạnh góc (trừ khi ở minCol/maxCol)
                if (col === minCol + 1 && !left1) return true; // Bỏ trống A1

                // Bỏ trống A13 hoặc A14, hoặc các trạng thái khác
                if (col === maxColInRow - 1 && !right1) {
                    const rightSeatCode = `${String.fromCharCode(65 + row)}${
                        col + 1
                    }`;
                    const rightSeat = allSeats?.[row]?.[col + 1];

                    // Kiểm tra nếu ghế cuối cùng đã được chọn hoặc đã bị đặt/trống/disabled
                    if (
                        selectedSeats.includes(rightSeatCode) ||
                        rightSeat?.status === "Booked" ||
                        rightSeat?.adminStatus === "empty" ||
                        rightSeat?.adminStatus === "disabled"
                    ) {
                        continue;
                    }

                    return true;
                }

                // Kiểm tra ghế lẻ giữa các ghế được chọn
                if ((!left1 && left2) || (!right1 && right2)) {
                    return true;
                }

                // Kiểm tra ghế lẻ trong khoảng trống giữa các ghế được chọn và khác dòng
                if (i < parsedSeats.length - 1) {
                    const nextCol = parsedSeats[i + 1].col;
                    const nextRow = parsedSeats[i + 1].row;

                    // Nếu có khoảng trống (ít nhất 1 ghế chưa chọn)
                    if (nextCol - col === 1 && nextRow === row) {
                        for (let j = col + 1; j < nextCol; j++) {
                            const isPrevOccupied = isOccupied(row, j - 1);
                            const isNextOccupied = isOccupied(row, j + 1);

                            // Nếu ghế trống và hai bên bị chiếm => Ghế lẻ
                            if (
                                !isOccupied(row, j) &&
                                (isPrevOccupied || isNextOccupied)
                            ) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false; // Không có ghế lẻ
            // debugger;
        },
        []
    );

    return { checkIsolatedSeat };
};

export default useIsolatedSeatChecker;
