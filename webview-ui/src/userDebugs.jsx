import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

const UserDebugs = ({ flattenedData }) => {
    const [userDebugs, setUserDebugs] = useState([]);
    useEffect(() => {
        console.log("flattenedData: ", flattenedData);
        let userDebugs = [];
        if (flattenedData) {
            flattenedData.forEach((element) => {
                if (element.isUserDebug) {
                    // Extract the value inside parentheses
                    const match = element.event.match(/\(([^)]+)\)/);
                    if (match) {
                        userDebugs.push({
                            event: match[1],
                            value: element.value, // The value inside parentheses
                            isUserDebug: element.isUserDebug
                        });
                        console.log("Extracted Value: ", match[1]); // Logs the value inside parentheses
                    }
                    console.log("isUserDebug: ", element);
                }
            });
            setUserDebugs(userDebugs);
        }
    }, [flattenedData]);
    return (
        <div className="userDebugs overflow-y-scroll h-[calc(100vh-49px)] px-0">
            {userDebugs && userDebugs.length > 0 ? (
                <Table className="rounded-none" isStriped aria-label="Example static collection table" color="primary">
                    <TableHeader>
                        <TableColumn className="font-bold">Line</TableColumn>
                        <TableColumn className="font-bold">Log</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No debugs to display."}>
                        {userDebugs.map(
                            (item, index) =>
                                item.isUserDebug && (
                                    <TableRow key={index}>
                                        <TableCell className="whitespace-nowrap text-[#ffa500] font-bold align-top">{item.event}</TableCell>
                                        <TableCell className="text-[#5497c3]">{item.value}</TableCell>
                                    </TableRow>
                                )
                        )}
                    </TableBody>
                </Table>
            ) : (
                <div>
                    <Table aria-label="Example static collection table" color="primary" defaultSelectedKeys={["1"]} selectionMode="single">
                        <TableHeader>
                            <TableColumn>Line</TableColumn>
                            <TableColumn>Log</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No debugs to display."}></TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default UserDebugs;
