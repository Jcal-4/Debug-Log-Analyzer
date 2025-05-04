/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

const UserDebugs = ({ flattenedData, setSelectedTab, scrollToElement }) => {
    const [userDebugs, setUserDebugs] = useState([]);
    useEffect(() => {
        console.log("flattenedData: ", flattenedData);
        let userDebugs = [];
        if (flattenedData) {
            flattenedData.forEach((element) => {
                if (element.isUserDebug) {
                    // Extract the value inside parentheses
                    const match = element.event.match(/\[([^\]]+)\]/);
                    if (match) {
                        userDebugs.push({
                            event: match[1],
                            value: element.value, // The value inside parentheses
                            isUserDebug: element.isUserDebug,
                            index: element.index
                        });
                    }
                }
            });
            console.log("userDebugs: ", userDebugs);
            setUserDebugs(userDebugs);
        }
    }, [flattenedData]);

    const handleClick = (event) => {
        const key = event.target.getAttribute("data-key").split(".")[0];
        console.log("key: ", key);
        setSelectedTab("analyzedDebugLogs");
        scrollToElement(key);
    };

    return (
        <div className="userDebugs overflow-y-scroll h-[calc(100vh-49px)] px-0">
            {userDebugs && userDebugs.length > 0 ? (
                <Table className="rounded-none" isStriped aria-label="Example static collection table" color="primary">
                    <TableHeader>
                        <TableColumn className="font-bold">Apex Line</TableColumn>
                        <TableColumn className="font-bold">Debug Value</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No debugs to display."}>
                        {userDebugs.map(
                            (item) =>
                                item.isUserDebug && (
                                    <TableRow key={item.index} data-key={item.index} className="cursor-pointer" onClick={handleClick}>
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
                            <TableColumn>Apex Line</TableColumn>
                            <TableColumn>Debug Value</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No debugs to display."}></TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default UserDebugs;
