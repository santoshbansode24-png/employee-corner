import React from 'react';
import DatePicker from 'react-datepicker';

const EmployeeDetailsCard = ({ basicInfo, updateBasicInfo, formatDate, CustomHeader }) => {
    return (
        <div className="arrears-card">
            <div className="card-header">
                <span className="badge badge-blue">01</span>
                <h2 className="card-title">Employee Details</h2>
            </div>
            <div className="card-body grid-3x2">
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input 
                        className="input-field" 
                        type="text" 
                        value={basicInfo.empName} 
                        onChange={e => updateBasicInfo('empName', e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Designation</label>
                    <input 
                        className="input-field" 
                        type="text" 
                        placeholder="सहायक प्राध्यापक" 
                        value={basicInfo.designation} 
                        onChange={e => updateBasicInfo('designation', e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">From Month</label>
                    <div className="date-picker-wrapper">
                        <DatePicker
                            selected={basicInfo.fromMonth ? new Date(basicInfo.fromMonth) : null}
                            onChange={(date) => updateBasicInfo('fromMonth', formatDate(date))}
                            dateFormat="yyyy-MM-dd"
                            renderCustomHeader={CustomHeader}
                            customInput={<input className="input-field" placeholder="2023-01-01" />}
                        />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">To Month</label>
                    <div className="date-picker-wrapper">
                        <DatePicker
                            selected={basicInfo.toMonth ? new Date(basicInfo.toMonth) : null}
                            onChange={(date) => updateBasicInfo('toMonth', formatDate(date))}
                            dateFormat="yyyy-MM-dd"
                            renderCustomHeader={CustomHeader}
                            customInput={<input className="input-field" placeholder="2023-06-30" />}
                        />
                    </div>
                </div>
                <div className="input-group col-span-2">
                    <label className="input-label">GR / Order Title</label>
                    <input 
                        className="input-field" 
                        type="text" 
                        placeholder="महाराष्ट्र शासन वित्त विभाग..." 
                        value={basicInfo.orderNo} 
                        onChange={e => updateBasicInfo('orderNo', e.target.value)} 
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailsCard;
